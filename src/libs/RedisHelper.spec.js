import assert from 'assert'
import RedisHelper from './RedisHelper'

const redis = new RedisHelper()

describe('RedisHelper', function() {
  it(`#set, #get, & #del() should set, get, and subsequently delete key without error`, async function() {
    const key = 'test_1'
    const val = 'val'

    await redis.set(key, val)
    const afterSetResult = await redis.get(key)
    await redis.del(key)
    const afterDeleteResult = await redis.get(key)

    assert.equal(val, afterSetResult)
    assert.equal(null, afterDeleteResult)
  })

  it(`#set with EX option`, async function() {
    const key = 'test_1'
    const val = 'val'

    await redis.set(key, val, 'EX', 60)
    const val2 = await redis.get(key)
    const myTtl = await redis.ttl(key)

    assert.equal(val, val2)
    assert.equal(true, myTtl <= 60)
  })
})
