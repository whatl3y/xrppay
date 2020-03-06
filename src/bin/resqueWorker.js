// import newrelic from 'newrelic'
import minimist from 'minimist'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import RedisHelper from '../libs/RedisHelper'
import Jobs from '../workers'
import startResqueServer from '../libs/startResqueServer'
import config from '../config'

const argv = minimist(process.argv.slice(2))
const log = bunyan.createLogger(config.logger.options)

const queues = argv.q || argv.queue || argv.queues || config.resque.getAllQueues()
const queuesAry = (typeof queues === 'string') ? queues.split(',') : queues

const redis = new RedisHelper()
const postgres = new PostgresClient()
const connectionDetails = { redis: redis.client }

const jobs = Jobs.reduce((obj, worker) => Object.assign(obj, worker({ log, postgres, redis })), {})

;(async function startResque() {
  const { worker } = startResqueServer({
    connection: connectionDetails,
    jobs: jobs,
    log: log,
    queues: queuesAry
  })

  const multiWorker = await worker()
  log.info(`Resque multi worker started...`)

  process.on('SIGINT', killProcess)
  process.on('SIGTERM', killProcess)

  async function killProcess() {
    multiWorker.workers.forEach(worker => multiWorker.cleanupWorker(worker))
    await multiWorker.end()

    log.info('Shut down worker')
    process.exit()
  }
})()
