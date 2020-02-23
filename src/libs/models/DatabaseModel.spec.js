import '../../tests/spec_helper'

import assert from 'assert'
import PostgresClient from '../PostgresClient'
import DatabaseModel from './DatabaseModel'
import { truncateUsers } from '../../tests/factories/Users'

const postgresUrl = process.env.DATABASE_TEST_URL || 'postgres://localhost:5432/xrppay_test'
const postgres = new PostgresClient(postgresUrl)

describe('DatabaseModel', () => {
  after(`truncate users`, async () => await truncateUsers(postgres))

  const users = Object.assign(DatabaseModel(postgres, 'users'), { accessibleColumns: [ 'name', 'username_email' ] })

  describe('#_getSanitizedValue', function() {
    it(`should sanitize values appropriately to prevent XSS, plus handle JS objects turning into JSON`, function() {
      const [shouldBe1, sani1] = [`This is awesome`, users._getSanitizedValue(`This is awesome`)]
      const [shouldBe2, sani2] = [`This is awesome `, users._getSanitizedValue(`This is awesome <script>alert('1')</script>`)]
      const [shouldBe3, sani3] = [`{"lance":"yoyo"}`, users._getSanitizedValue({lance: 'yoyo'})]
      const [shouldBe4, sani4] = [`{"lance":"yoyo "}`, users._getSanitizedValue({lance: "yoyo <script>alert('2')</script>"})]
      const [shouldBe5, sani5] = [`{"lance":"yoyo <script>alert('2')</script>"}`, users._getSanitizedValue(JSON.stringify({lance: "yoyo <script>alert('2')</script>"}), false)]

      assert.equal(sani1, shouldBe1)
      assert.equal(sani2, shouldBe2)
      assert.equal(sani3, shouldBe3)
      assert.equal(sani4, shouldBe4)
      assert.equal(sani5, shouldBe5)
    })

    it(`should replace escaped ampersands with a normal ampersand`, function() {
      assert.equal(`me & you`, users._getSanitizedValue(`me & you<script>alert('1')</script>`))
    })
  })

  describe('#setRecord', function() {
    beforeEach('reset record each test', function() {
      users.resetRecord()
    })

    it(`should set the internal record of the object to be saved or used later`, function() {
      users.setRecord({ name: 'Lance' })
      assert.equal(undefined, users.record.username_email)
      assert.equal('Lance', users.record.name)
    })

    it(`should set the internal record of the object but prevent restrictedColumns from being set`, function() {
      users.restrictedColumns = [ 'name' ]

      users.setRecord({ name: 'Lance' })
      assert.equal(undefined, users.record.username_email)
      assert.equal(undefined, users.record.name)

      users.restrictedColumns = []
    })
  })

  describe('#resetRecord', function() {
    it(`should reset the internal record of the object to an empty Object`, function() {
      users.setRecord({ username_mail: 'lance' })
      users.resetRecord()
      assert.equal(undefined, users.record.username_email)
      assert.equal(undefined, users.record.name)
    })
  })

  describe('#getAll', function() {
    before('clear users table', async () => await postgres.query(`truncate users cascade`))
    after('clear users table', async () => await postgres.query(`truncate users cascade`))

    it(`should get all user records in the DB`, async function() {
      const allUserRecords = await users.getAll()
      assert.equal(0, allUserRecords.length)

      await postgres.query(`insert into users (username_email, name) values ('lance@acme.com', 'Lance Ldub')`)

      const allUserRecords2 = await users.getAll()
      assert.equal(1, allUserRecords2.length)
      assert.equal('lance@acme.com', allUserRecords2[0].username_email)
      assert.equal('Lance Ldub', allUserRecords2[0].name)
    })
  })

  describe('#save', function() {
    beforeEach(`reset record and callbacks`, function() {
      users.resetRecord()
      users.callbacks.beforeSave = () => {}
      users.callbacks.afterSave = () => {}
    })

    it(`should create a new user without errors`, async function() {
      users.setRecord({ username_email: 'test1@acme.com' }, true)
      const newId = await users.save()
      const id = parseInt(newId)

      assert.equal('number', typeof id)
      assert.equal(false, isNaN(id))
    })

    it(`should create a new user without errors and execute beforeSave callback before saving record`, async function() {
      let beforeGotCalled = false
      users.callbacks.beforeSave = function() {
        assert.equal('[object Object]', this.record.toString())
        assert.equal(undefined, this.record.id)
        beforeGotCalled = true
      }

      users.setRecord({ username_email: 'test2@acme.com' }, true)
      const newId = await users.save()
      const id = parseInt(newId)

      assert.equal('number', typeof id)
      assert.equal(false, isNaN(id))
      assert.equal(true, beforeGotCalled)
    })

    it(`should create a new user without errors and execute afterSave callback before saving record, in addition to no error with null beforeSave`, async function() {
      let afterGotCalled = false
      delete(users.callbacks.beforeSave)
      users.callbacks.afterSave = function() {
        assert.equal('[object Object]', this.record.toString())

        // `bigint` type in DB returns from node-pg as string
        assert.equal('string', typeof this.record.id)
        assert.equal(true, this.record.id.length > 0)
        afterGotCalled = true
      }

      users.setRecord({ username_email: 'test3@acme.com' }, true)
      const newId = await users.save()
      const id = parseInt(newId)

      assert.equal('number', typeof id)
      assert.equal(false, isNaN(id))
      assert.equal(true, afterGotCalled)
    })
  })
})
