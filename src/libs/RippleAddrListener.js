// import newrelic from 'newrelic'
import RippleClient from './RippleClient'
import XrplTransactions from './models/XrplTransactions'
import UserWallets from './models/UserWallets'
import config from '../config'

export default function RippleAddrListener({ io, log, postgres, redis }) {
  return {
    async listen() {
      const ripple = RippleClient()
      const subscribeResponse = await ripple.subscribeToAddress(config.ripple.masterClassicAddr, async function processTxn(evt) {
        const wallets = UserWallets(postgres)
        const txn = await XrplTransactions(postgres).createFromEventStream(evt)
        log.debug("New wallet transaction", txn)

        const txnType = [ config.ripple.masterAddr, config.ripple.masterClassicAddr ].includes(txn.destination_account_hash)
          ? 'credit'
          : 'debit'
        
        const userIdAffected = txnType === 'credit' ? txn.destination_tag : txn.source_tag
        if (!userIdAffected)
          return

        const userWalletAffected = await wallets.findBy({ user_id: userIdAffected, type: 'xrp' })
        if (userWalletAffected) {
          const baseAmount = ripple.client.dropsToXrp(txn.amount_drops)
          const totalAmountChange = (txnType === 'credit') ? baseAmount : (parseFloat(baseAmount) + parseFloat(ripple.client.dropsToXrp(txn.fee_drops))).toString()
          const newWalletRecord = await wallets.updateIncremental(userIdAffected, 'xrp', txnType, totalAmountChange)
          io.in(`user_${userIdAffected}`).emit(`setUserWallet`, { xrp: newWalletRecord })
        }
      })
    
      log.debug("Subscribe response:", subscribeResponse)
    }
  }
}