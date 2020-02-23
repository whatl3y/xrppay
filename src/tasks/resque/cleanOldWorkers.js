import minimist from 'minimist'
import { Queue } from 'node-resque'
import RedisHelper from '../../libs/RedisHelper'

const argv = minimist(process.argv.slice(2))
const ageOfJob  = parseInt(argv.a || argv.age || 0)

;(async () => {
  const redis = new RedisHelper()
  const queue = new Queue({ connection: { redis: redis.client }})
  await queue.connect()

  const results = await queue.cleanOldWorkers(ageOfJob)
  console.log(`clean workers results`, JSON.stringify(results))

  await queue.end()
  process.exit()
})()
