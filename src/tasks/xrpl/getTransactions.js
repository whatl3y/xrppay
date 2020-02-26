require('dotenv').config()

import minimist from 'minimist'
import RippleClient from '../../libs/RippleClient'
// import config from '../../config'

const argv = minimist(process.argv.slice(2))
const addr = argv.a
const minLedgerVersion = argv.m

;(async function getTransactions() {
  try {
    const res = await RippleClient().getTransactions(addr, { minLedgerVersion })
    console.log(`Transaction info:`, JSON.stringify(res, null, 2))

  } catch(err) {
    console.error(`Error getting transactions`, err)
  } finally {
    process.exit()
  }
})()
