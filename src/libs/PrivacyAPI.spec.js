import assert from 'assert'
import PrivacyAPI from './PrivacyAPI'
import config from '../config'

describe('PrivacyAPI', function() {
  const privacy = PrivacyAPI(config.privacy.apiKey)

  describe('#generateHmac', function() {
    it('generate an HMAC token from the provided object', function() {
      const token = privacy.generateHmac(JSON.stringify({ lance: 1 }))
      assert.equal('string', typeof token)
    })
  })
})
