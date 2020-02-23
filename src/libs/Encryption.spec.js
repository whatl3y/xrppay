import path from 'path'
import assert from 'assert'
import Encryption from './Encryption.js'

describe('Encryption', function() {
  const enc = new Encryption({secret: 'abc123'})
  const originalText = 'test123'
  let cipherTextAndIv
  let plainText
  let hash

  describe('#encrypt()', function() {
    it(`should encrypt string without issue`, () => {
      cipherTextAndIv = enc.encrypt(originalText)
      assert.equal(typeof cipherTextAndIv, 'string')
      assert.equal(2, cipherTextAndIv.split(':').length)
    })
  })

  describe('#decrypt()', function() {
    it(`should decrypt cipher string without issue`, () => {
      plainText = enc.decrypt(cipherTextAndIv)
      assert.equal(typeof plainText, 'string')
      assert.equal(plainText, originalText)
    })
  })

  describe('#stringToHash()', function() {
    it(`should hash string without issue`, () => {
      hash = Encryption.stringToHash(plainText || originalText)
      assert.equal(typeof hash, 'string')
    })
  })

  describe('#fileToHash()', function() {
    it(`should hash file contents without issue`, async () => {
      await enc.fileToHash(path.join(__dirname, 'Encryption.js'))
    })
  })

  describe('#hashPassword() and #comparePassword()', function() {
    let plainPassword = 'test123'
    let hashedPassword

    it(`hashPassword should hash a password as expected`, async () => {
      hashedPassword = await Encryption.hashPassword(plainPassword)
      assert.equal(true, plainPassword != hashedPassword)
      assert.equal(true, hashedPassword.length > 0)
    })

    it(`comparePassword should compare hash with plain password correctly`, async () => {
      const matches = await Encryption.comparePassword(plainPassword, hashedPassword)
      assert.equal(true, matches)
    })
  })
})
