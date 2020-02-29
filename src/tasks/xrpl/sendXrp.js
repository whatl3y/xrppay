import minimist from 'minimist'
import RippleClient from '../../libs/RippleClient'
import PostgresClient from '../../libs/PostgresClient'
import CryptoWallet from '../../libs/models/CryptoWallet'
import config from '../../config'

const postgres = new PostgresClient()
const argv = minimist(process.argv.slice(2))
const sourceAddr = argv.a
const sourcePriKey = argv.s
const sourceTag = argv.st
const xrpToSend = argv.x

// provide userId or destination address
const desintationUserId = argv.u
const destinationAddr = argv.d
const destinationTag = argv.t

;(async function sendXrp() {
  try {
    if (!(desintationUserId || (destinationAddr && destinationTag)))
      return console.log("Please specify a user or destination address to send XRP to.")
  
    let wallet = null
    if (desintationUserId) {
      const wallets = CryptoWallet(postgres)
      wallet = await wallets.findBy({ user_id: desintationUserId, type: 'xrp' })
    } else {
      wallet = {
        mod2: destinationAddr,
        mod1: destinationTag
      }
    }

    if (!wallet)
      return console.log("No destination XRP wallet available.")

    const res = await RippleClient().sendPayment(
      sourceAddr,
      sourcePriKey,
      sourceTag ? parseInt(sourceTag) : undefined,
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
