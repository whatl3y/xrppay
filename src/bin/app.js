/* Entry point for express web server
 * to listen for HTTP requests
 */

import newrelic from 'newrelic'
import bunyan from 'bunyan'
import sticky from 'sticky-cluster'
import WebServer from '../libs/WebServer'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const [ httpServer, startServer ] = WebServer()

// entry point to start server
// 'sticky' allows for multiple processes based on
// concurrency configurations (i.e. num CPUs available.)
sticky(async function startingWebServer(callback) {
  try {
    await startServer()
    callback(httpServer)

    log.info(`listening on *:${config.server.port}`)

  } catch(err) {
    log.error(`Web server error`, err)
    process.exit()
  }
}, {
  concurrency:  config.server.concurrency,
  port:         config.server.port,
  debug:        !config.server.isProduction
})
