// import newrelic from 'newrelic'
import RippleClient from './RippleClient'
import PrivacyCards from './models/PrivacyCards'
import XrplTransactions from './models/XrplTransactions'
import Users from './models/Users'
// import CryptoWallet from './models/CryptoWallet'
import config from '../config'

export default function RippleAddrListener({ io, log, postgres, redis }) {
  return {
    async listen() {
      const ripple = RippleClient()
      const subscribeResponse = await ripple.subscribeToAddress(config.ripple.masterClassicAddr, async function processTxn(evt) {
        const txn = await XrplTransactions(postgres).createFromEventStream(evt)
        log.info("New wallet transaction", txn)

        const txnType = [ config.ripple.masterAddr, config.ripple.masterClassicAddr ].includes(txn.destination_account_hash)
          ? 'credit'
          : 'debit'

        const userIdAffected = txnType === 'credit' ? txn.destination_tag : txn.source_tag
        if (!userIdAffected)
          return

        const updatedWallet = await XrplTransactions(postgres).refreshUserWallet(userIdAffected)
        io.in(`user_${userIdAffected}`).emit('setUserWallet', { xrp: updatedWallet })

        if (txnType === 'credit') {
          const priv = PrivacyCards(postgres)
          let [ card, user ] = await Promise.all([
            priv.findBy({ user_id: user.id, is_active: true }),
            Users(postgres).find(userIdAffected)
          ])
          if (!card && wallet && wallet.current_amount > 0)
            card = await priv.createCard(user)

          io.in(`user_${userIdAffected}`).emit(`getPrivacyActiveCard`, card)
        }
      })
    
      log.debug("Subscribe response:", subscribeResponse)
    }
  }
}