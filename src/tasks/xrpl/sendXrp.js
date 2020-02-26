require('dotenv').config()

import minimist from 'minimist'
import RippleClient from '../../libs/RippleClient'
import PostgresClient from '../../libs/PostgresClient'
import CryptoWallet from '../../libs/models/CryptoWallet'
// import config from '../../config'

const postgres = new PostgresClient()
const argv = minimist(process.argv.slice(2))
const sourceAddr = argv.a
const sourcePriKey = argv.s
const xrpToSend = argv.x
const desintationUserId = argv.u

;(async function sendXrp() {
  try {
    if (!desintationUserId)
      return console.log("Please specify a user to send currency to.")
  
    const wallets = CryptoWallet(postgres)
    const wallet = await wallets.findBy({ user_id: desintationUserId, type: 'xrp' })
    if (!wallet)
      return console.log("No XRP wallet for user.")

    const res = await RippleClient().sendPayment(
      sourceAddr,
      sourcePriKey,
      wallet.mod2, // wallet.public_addr,
      parseInt(wallet.mod1),
      xrpToSend)
  
    console.log(`Successfully sent currency:`, JSON.stringify(res, null, 2))

  } catch(err) {
    console.error(`Error sending currency`, err)
  } finally {
    process.exit()
  }
})()
