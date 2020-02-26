require('dotenv').config()

import minimist from 'minimist'
import RippleClient from '../../libs/RippleClient'
// import config from '../../config'

const argv = minimist(process.argv.slice(2))
const version = argv.v

;(async function getLedger() {
  try {
    const res = await RippleClient().getLedger(version, { includeState: true })
    console.log(`Ledger info:`, JSON.stringify(res, null, 2))

  } catch(err) {
    console.error(`Error getting ledger`, err)
  } finally {
    process.exit()
  }
})()
