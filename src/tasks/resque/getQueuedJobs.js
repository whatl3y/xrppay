import minimist from 'minimist'
import { Queue } from 'node-resque'
import RedisHelper from '../../libs/RedisHelper'
import config from '../../config'

const argv      = minimist(process.argv.slice(2))
const queueName = argv.q || argv.queue || config.resque.default_queue
const start     = argv.s || argv.start || 0
const end       = argv.e || argv.end || 10

;(async () => {
  const redis = new RedisHelper()
  const queue = new Queue({ connection: { redis: redis.client }})
  await queue.connect()

  const jobs = await queue.queued(queueName, start, end)
  jobs.forEach(job => console.log(JSON.stringify(job)))

  await queue.end()
  process.exit()
})()
