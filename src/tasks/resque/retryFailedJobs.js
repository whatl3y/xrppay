import minimist from 'minimist'
import { Queue } from 'node-resque'
import RedisHelper from '../../libs/RedisHelper'

const argv = minimist(process.argv.slice(2))
const countOnly   = argv.c || argv.count
const onlyRemove  = argv.d || argv.delete || argv.r || argv.remove

;(async () => {
  const redis = new RedisHelper()
  const queue = new Queue({ connection: { redis: redis.client }})
  await queue.connect()

  const failedCount = await queue.failedCount()

  if (countOnly) {
    console.log(`Currently ${failedCount} failed jobs.`)
  } else {
    const numJobs = Math.min(2500, failedCount)
    const failedJobs = await queue.failed(0, numJobs)
    let method  = 'retryAndRemoveFailed'
    let verb    = 'Retried'
    if (onlyRemove) {
      method  = 'removeFailed'
      verb    = 'Deleted'
    }

    await Promise.all(failedJobs.map(async job => await queue[method](job)))
    console.log(`${verb} ${numJobs} failed jobs.`)
  }

  await queue.end()
  process.exit()
})()
