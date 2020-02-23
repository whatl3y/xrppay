import fs from 'fs'
import path from 'path'
import minimist from 'minimist'
import moment from 'moment'
import { titleCase } from '../../libs/Helpers'
import config from '../../config'

const readFile = fs.promises.readFile
const writeFile = fs.promises.writeFile

const argv = minimist(process.argv.slice(2))
const tableName = argv.t || argv.table || argv._[0]

;(async function() {
  try {
    const titleCaseTable = titleCase(tableName, true).replace(/\s/g, '')
    const migrationTargetDir = path.join(config.app.rootDir, '..', 'src', 'database', 'migrations')
    const modelTargetDir = path.join(config.app.rootDir, '..', 'src', 'libs', 'models')
    const replaceTablePlaceholders = str => {
      return str
        .replace(/\{table\}/g, tableName)
        .replace(/\{Table\}/g, titleCaseTable)
    }

    const [
      migrationFileContents,
      modelFileContents
    ] = await Promise.all([
      readFile(path.join(__dirname, 'migrationContents.txt'), { encoding: 'utf-8' }),
      readFile(path.join(__dirname, 'modelContents.txt'), { encoding: 'utf-8' })
    ])

    const finalMigrationContents = replaceTablePlaceholders(migrationFileContents)
    const finalModelContents = replaceTablePlaceholders(modelFileContents)

    const newMigFilename = `${moment.utc().format('YYYYMMDDhhmmss')}_${tableName}.js`
    const finalMigrationPath = path.join(migrationTargetDir,  newMigFilename)
    const finalModelPath = path.join(modelTargetDir, `${titleCaseTable}.js`)

    await Promise.all([
      writeFile(finalMigrationPath, finalMigrationContents),
      writeFile(finalModelPath, finalModelContents)
    ])

    console.log(`\nSuccessfully created new model ${tableName}!`)
    console.log(finalMigrationPath)
    console.log(finalModelPath)
    console.log(`\n`)

  } catch(err) {
    console.error("Error creating new model", err)
  } finally {
    process.exit()
  }
})()
