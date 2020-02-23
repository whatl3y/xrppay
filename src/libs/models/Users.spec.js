import '../../tests/spec_helper'

// import path from 'path'
import assert from 'assert'
import PostgresClient from '../PostgresClient'
import Users from './Users.js'

const NOOP = () => {}
const postgresUrl = process.env.DATABASE_TEST_URL || 'postgres://localhost:5432/xrppay_test'

const pg = new PostgresClient(postgresUrl)
const users = Users(pg)

describe('Users', function() {
  describe('#passwordHasMinimumRequirements', function() {
    it('should allow passwords with minimum requirements of 8 chars min and 3 of the following classes: lowercase, uppercase, number, special char', function() {
      const pass1 = `abcccc123$`
      const pass2 = 'Abcccc123'
      const pass3 = `A12222$123`

      const notpass1 = `aB2$` // not enough chars
      const notpass2 = `abc123333` // only 2 classes
      const notpass3 = `ABCCCC@#$` // only 2 classes

      assert.equal(true, users.passwordHasMinimumRequirements(pass1))
      assert.equal(true, users.passwordHasMinimumRequirements(pass2))
      assert.equal(true, users.passwordHasMinimumRequirements(pass3))
      assert.equal(false, users.passwordHasMinimumRequirements(notpass1))
      assert.equal(false, users.passwordHasMinimumRequirements(notpass2))
      assert.equal(false, users.passwordHasMinimumRequirements(notpass3))
    })
  })

  describe('#setSession', function() {
    it('should set key/value pairs in the session', async function() {
      const session1          = { save: function(cb) { this.num_saves++; cb() }, num_saves: 0, test_key: 'test_val' }
      const session2          = { save: function(cb) { this.num_saves++; cb() }, num_saves: 0, test_key: 'test_val' }
      const usersWithSession1 = Users(pg, session1)
      const usersWithSession2 = Users(pg, session2)
      const shouldBeFalse     = await users.setSession({})
      const result1           = await usersWithSession1.setSession({ my_key: 'my_val' })
      const result2           = await usersWithSession2.setSession({ obj1: { obj2: { my_val: 'lance' }}})

      assert.equal(false, shouldBeFalse)
      assert.equal(true, result1)
      assert.equal(true, result2)

      assert.equal(1, session1.num_saves)
      assert.equal('my_val', session1.my_key)

      assert.equal(3, session2.num_saves)
      assert.equal('[object Object]', session2.obj1.toString())
      assert.equal('lance', session2.obj1.obj2.my_val)
    })
  })

  describe('#login', function() {
    it('should set key/value pairs under the `user` key in the session', async function() {
      const session          = { save: function(cb) { this.num_saves++; cb() }, num_saves: 0, test_key: 'test_val' }
      const usersWithSession = Users(pg, session)
      const result1           = await usersWithSession.login({ my_key: 'my_val' })

      assert.equal(2, session.num_saves)
      assert.equal('my_val', session.user.my_key)
    })
  })

  describe('#generateTempPassword', function() {
    it('should generate a random string of alphanumeric characters of length specified', function() {
      const users = Users()
      const password = users.generateTempPassword(10)

      assert.equal(10, password.length)
      assert.equal(true, /[\w\d]{10}/.test(password))
    })
  })
})
