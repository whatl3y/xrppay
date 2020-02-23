import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import util from 'util'

const fsStatPromise     = util.promisify(fs.stat)
const fsWriteFile       = util.promisify(fs.writeFile)
const mkdirPromise      = util.promisify(fs.mkdir)
const readFilePromise   = util.promisify(fs.readFile)
const readdirPromise    = util.promisify(fs.readdir)

export default function FileManagement() {
  return {
    getLocalFileStream(filePath) {
      return fs.createReadStream(filePath)
    },

    async getLocalFile(filePath, encoding=null) {
      return await readFilePromise(filePath, { encoding })
    },

    async readDir(dirPath) {
      return await readdirPromise(dirPath)
    },

    async deleteDir(dirPath) {
      return await new Promise((resolve, reject) => {
        rimraf(dirPath, err => {
          if (err)
            return reject(err)

          resolve()
        })
      })
    },

    async checkAndCreateDirectoryOrFile(filepath, isFile=false, fileContents=JSON.stringify([])) {
      try {
        if (isFile && !(await this.doesFileExist(filepath))) {
          // Since all files should hold JSON that will be large arrays,
          // initialize the file with an empty array
          await fsWriteFile(filepath, fileContents)
        } else if (!(await this.doesDirectoryExist(filepath))) {
          await mkdirPromise(filepath)
        }

        return true

      } catch(err) {
        if (err.code == 'EEXIST')
          return true

        throw err
      }
    },

    async doesDirectoryExist(filePath) {
      return await this.doesDirOrFileExist(filePath, 'isDirectory')
    },

    async doesFileExist(filePath) {
      return await this.doesDirOrFileExist(filePath, 'isFile')
    },

    async doesDirOrFileExist(filePath, method) {
      try {
        const stats = await fsStatPromise(filePath)
        return stats[method]()
      } catch(e) {
        return false
      }
    },

    getFileName(fileName, extraText=Date.now()) {
      fileName = encodeURIComponent(fileName)
      return `${fileName.split('.').slice(0, -1).join('.')}_${extraText}${path.extname(fileName)}`
    }
  }
}
