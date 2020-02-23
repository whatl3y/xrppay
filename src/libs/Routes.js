import fs from 'fs'
import path from 'path'
import util from 'util'
import config from '../config'

const readDir = util.promisify(fs.readdir)

export default function Routes({ postgres, redis, log }) {
  return {
    _path: path.join(__dirname, '..', 'routes'),

    async get() {
      const files       = await readDir(this._path)
      const routeFiles  = files.filter(file => fs.lstatSync(path.join(this._path, file)).isFile()).filter(file => !/\.spec\.js$/.test(file))
      const routes = routeFiles.map(file => {
        const routeInfo = require(path.join(this._path, file)).default({ postgres, redis, log })
        return {
          verb: routeInfo.verb,
          path: routeInfo.route,
          order: routeInfo.priority,
          file: file,
          handler: routeInfo.handler
        }
      })

      return routes.sort((r1, r2) => r1.order - r2.order)
    },

    apiKeyMiddleware() {
      return function(req, res, next) {
        try {
          let code = req.headers[config.apiKeyHeader]
          if (!code) {
            if (req.method.toLowerCase() === 'post') {
              code = req.body[config.apiKeyHeader] || req.query[config.apiKeyHeader]
            } else {
              code = req.query[config.apiKeyHeader] || req.body[config.apiKeyHeader]
            }
          }
          req.xrppayAuth = code
          next()

        } catch(err) {
          next(err)
        }
      }
    }
  }
}