// import newrelic from 'newrelic'
import bunyan from 'bunyan'
import RedisHelper from '../libs/RedisHelper'
import startResqueServer from '../libs/startResqueServer'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

const redis = new RedisHelper()
const connectionDetails = { redis: redis.client }

;(async function startResque() {
  const { scheduler } = startResqueServer({
    connection: connectionDetails,
    log: log
  })

  const schedulerDaemon = await scheduler()
  log.info(`Resque scheduler started...`)

  process.on('SIGINT', killProcess)
  process.on('SIGTERM', killProcess)

  async function killProcess() {
    await schedulerDaemon.end()
    log.info('Shut down scheduler')
    process.exit()
  }
})()
