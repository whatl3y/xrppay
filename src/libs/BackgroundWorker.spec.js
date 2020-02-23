import assert from 'assert'
import Redis from 'ioredis-mock'
import BackgroundWorker from './BackgroundWorker'
import RedisHelper from './RedisHelper'

const redisMock = new Redis()
const redis = new RedisHelper(redisMock)

describe('BackgroundWorker', function() {
  const worker = BackgroundWorker({ redis })

  describe('#enqueue', function() {
    it(`should connect to the redis instance and queue up a job`, async function() {
      await worker.enqueue('theJob', { param: 'one' })
      const allKeys = await redis.client.keys('resque:*')
      assert.equal(true, allKeys.includes('resque:connection_test_key'))
      assert.equal(1, await redis.client.llen('resque:queue:xrppay_resque_default'))
    })
  })
})
