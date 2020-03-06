import assert from 'assert'
import RippleClient from './RippleClient'

const ripple = RippleClient()

describe('RippleClient', function() {
  after('disconnect from server', async function() {
    await ripple.disconnect()
  })

  // it(`#getAccountInfo`, async function() {
  //   const info = await ripple.getAccountInfo('rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg')
  //   assert.equal('object', typeof info)
  //   assert.equal('string', typeof info.xrpBalance)
  // })

  it(`#getBalances`, async function() {
    const info = await ripple.getBalances('rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg')
    assert.equal(true, info instanceof Array)
    assert.equal('string', typeof info[0].value)
  })

  it(`#generateAddress`, function() {
    const { xAddress, secret } = ripple.generateAddress()
    assert.equal('string', typeof xAddress)
    assert.equal('string', typeof secret)
  })
})
