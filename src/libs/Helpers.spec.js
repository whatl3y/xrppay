import assert from 'assert'
import PostgresClient from './PostgresClient'
import RedisHelper from './RedisHelper'
import {
  arrayGroupBy,
  camelCaseToUnderscore,
  createNestedArrays,
  flatten,
  paginateArray,
  objectDeepAssign,
  titleCase,
  getCacheToDatabaseFallback
} from './Helpers'

const redis = new RedisHelper()
const postgresUrl = process.env.DATABASE_TEST_URL || 'postgres://localhost:5432/xrppay_test'
const postgres = new PostgresClient(postgresUrl)

describe('Helpers', function() {
  describe('#camelCaseToUnderscore', function() {
    it(`should convert strings to lower case and convert any camel-casing to underscores`, function() {
      const str1 = "myString"
      const str2 = "My_string"
      const str3 = "MyString"
      const str4 = "my_string_thoughSir"
      const desired123 = 'my_string'
      const desired4 = 'my_string_though_sir'

      assert.equal(desired123, camelCaseToUnderscore(str1))
      assert.equal(desired123, camelCaseToUnderscore(str2))
      assert.equal(desired123, camelCaseToUnderscore(str3))
      assert.equal(desired4, camelCaseToUnderscore(str4))
    })
  })

  describe('#createNestedArrays', function() {
    it(`should return an array of arrays of specified length`, function() {
      const ary = new Array(100).fill(0).map((_, i) => i+1)
      const nested5 = createNestedArrays(ary, 5)
      const nested10 = createNestedArrays(ary, 10)
      const nested25 = createNestedArrays(ary, 25)

      assert.equal(20, nested5.length)
      assert.equal(5, nested5[0].length)
      assert.equal(5, nested5[19].length)
      assert.equal('undefined', typeof nested5[20])
      assert.equal(1, nested5[0][0])
      assert.equal(2, nested5[0][1])
      assert.equal(3, nested5[0][2])
      assert.equal(4, nested5[0][3])
      assert.equal(5, nested5[0][4])
      assert.equal('undefined', typeof nested5[0][5])

      assert.equal(10, nested10.length)
      assert.equal(4, nested25.length)
    })
  })

  describe('#flatten', function() {
    it(`should flatten array with nested arrays`, function() {
      const nestedArray1 = [1, 2, [3, [4, 5]], [6, [7, 8, 9, [10]]]]
      const desiredArray1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      const flattenedArray1 = flatten(nestedArray1)
      flattenedArray1.forEach((v, i) => {
        assert.equal(desiredArray1[i], v)
      })
    })
  })

  describe('#arrayGroupBy', function() {
    it(`should convert array to object grouped by items that match the mapper`, function() {
      const ary = [{ i: 1 }, { i: 2 }, { i: 2 }, { i: 3 }, { i: 3 }, { i: 3 }]
      const mapper = x => x.i

      const grouped = arrayGroupBy(ary, mapper)
      Object.keys(grouped).forEach(num => {
        assert.equal(parseInt(num), grouped[num].length)
      })
    })
  })

  describe(`#objectDeepAssign()`, function() {
    it(`should copy target array(s) into source recursively when nested objects exist`, function() {
      let source    = { a: 1, b: { c: { d: 2 }}, e: 3 }
      const target1 = { a: 10 }
      const target2 = { b: { f: 4 }}
      const target3 = { b: { g: 20 }, f: { g: 50 }}
      objectDeepAssign(source, target1, target2, target3)

      assert.equal(10, source.a)
      assert.equal(2, source.b.c.d)
      assert.equal(20, source.b.g)
      assert.equal(4, source.b.f)
    })
  })

  describe(`#titleCase()`, function() {
    it(`should convert a string to title case and optionall remove underscores if desired`, function() {
      const str1 = 'say what sir'
      const output1 = 'Say What Sir'
      const str2 = 'whoa_man'
      const output2 = 'Whoa_man'
      const output2_5 = 'Whoa Man'

      const result1 = titleCase(str1)
      const result1_5 = titleCase(str1, true)
      const result2 = titleCase(str2)
      const result2_5 = titleCase(str2, true)

      assert.equal(output1, result1)
      assert.equal(output1, result1_5)
      assert.equal(output2, result2)
      assert.equal(output2_5, result2_5)
    })
  })

  describe('#getCacheToDatabaseFallback', function() {
    before('clear previously cached records', async function() {
      await redis.del('test_key_345')
    })

    it(`should get and NOT cache an empty array of results that don't exist`, async function() {
      const key = 'test_key_123'
      const emptyArray = await getCacheToDatabaseFallback({ redis, postgres }, key, `select * from users where id = $1`, [5000])

      assert.equal(true, emptyArray instanceof Array)
      assert.equal(0, emptyArray.length)

      const nothingInCache = await redis.get(key)
      assert.equal(null, nothingInCache)
    })

    it(`should get and cache a set of results that has at least 1 row of results`, async function() {
      const key = 'test_key_345'
      const emptyArray = await getCacheToDatabaseFallback({ redis, postgres }, key, `select 1 as myCol`)

      assert.equal(true, emptyArray instanceof Array)
      assert.equal(1, emptyArray.length)

      const cachedResults = JSON.parse(await redis.get(key))
      assert.equal(true, cachedResults instanceof Array)
      assert.equal(1, cachedResults.length)
    })
  })
})
