require('dotenv').config()

import minimist from 'minimist'
import RippleClient from '../../libs/RippleClient'
// import config from '../../config'

const argv = minimist(process.argv.slice(2))
const hash = argv.h

;(async function getTransaction() {
  try {
    const res = await RippleClient().getTransaction(hash)
    console.log(`Transaction info:`, JSON.stringify(res, null, 2))

  } catch(err) {
    console.error(`Error getting transaction`, err)
  } finally {
    process.exit()
  }
})()
