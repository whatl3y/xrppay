require('dotenv').config()

import minimist from 'minimist'
import RippleClient from '../../libs/RippleClient'
// import config from '../../config'

const argv = minimist(process.argv.slice(2))
const addr = argv.a

;(async function getBalances() {
  try {
    const res = await RippleClient().getBalances(addr)
    console.log(`Balance info:`, JSON.stringify(res, null, 2))

  } catch(err) {
    console.error(`Error getting balances`, err)
  } finally {
    process.exit()
  }
})()
