// import newrelic from 'newrelic'
import minimist from 'minimist'
// import throng from 'throng'
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

const redis             = new RedisHelper()
const postgres          = new PostgresClient()
const connectionDetails = { redis: redis.client }

const jobs = Jobs.reduce((obj, worker) => Object.assign(obj, worker({ log, postgres, redis })), {})

// entry point to workers
// throng({
//   workers:  config.server.concurrency,
//   lifetime: Infinity,
//   grace:    3000,
//   start:    startResqueServer({ connection: connectionDetails, jobs: jobs, log: log, queues: queuesAry })
// })

;(async function startResque() {
  const start = startResqueServer({
    connection: connectionDetails,
    jobs: jobs,
    log: log,
    queues: queuesAry
  })

  const { multiWorker, scheduler } = await start()

  process.on('SIGINT', killProcess)
  process.on('SIGTERM', killProcess)

  async function killProcess() {
    multiWorker.workers.forEach(worker => multiWorker.cleanupWorker(worker))
    await multiWorker.end()
    await scheduler.end()

    log.info('Shut down worker')
    process.exit()
  }
})()
