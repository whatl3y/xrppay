import assert from 'assert'
import PostgresSqlParser from './PostgresSqlParser'

describe('PostgresSqlParser', function() {
  describe('#parse', function() {
    it('creates a object of a parsed query', function() {
      const parser = PostgresSqlParser('select * from visitors limit 5 offset 10')
      parser.parse()
      assert.equal(true, parser.parsedObj instanceof Array)
      assert.equal('SelectStmt', Object.keys(parser.parsedObj[0])[0])
    })
  })

  describe('#setQuery', function() {
    it('resets the query to a new query', function() {
      const parser = PostgresSqlParser('select * from visitors limit 5 offset 10')
      parser.setQuery('select 1').deparse()
      assert.equal('select 1', parser.query.toLowerCase())
    })
  })

  describe('#setLimit', function() {
    it('resets the LIMIT of the new query to the limit specified', function() {
      const parser = PostgresSqlParser('select * from visitors limit 5 offset 10')
      parser.setLimit(20).deparse()
      assert.equal(true, parser.query.toLowerCase().includes('limit 20'))
    })
  })

  describe('#setOffset', function() {
    it('resets the OFFSET of the new query to the offset specified', function() {
      const parser = PostgresSqlParser('select * from visitors limit 5 offset 10')
      parser.setOffset(20).deparse()
      assert.equal(true, parser.query.toLowerCase().includes('offset 20'))
    })
  })
})
