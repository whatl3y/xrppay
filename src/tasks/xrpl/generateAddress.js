import RippleClient from '../../libs/RippleClient'
import config from '../../config'

;(function generateAddress() {
  try {
    console.log(`New Address:`, RippleClient().generateAddress())

  } catch(err) {
    console.error(`Error generating address`, err)
  } finally {
    process.exit()
  }
})()
