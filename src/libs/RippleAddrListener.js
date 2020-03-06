// import newrelic from 'newrelic'
import RippleClient from './RippleClient'
import PrivacyCards from './models/PrivacyCards'
import CryptoTransactions from './models/CryptoTransactions'
import Users from './models/Users'
import config from '../config'

export default function RippleAddrListener({ io, log, postgres, redis }) {
  return {
    async listen() {
      const ripple = RippleClient()
      const subscribeResponse = await ripple.subscribeToAddress(config.ripple.masterClassicAddr, async function processTxn(evt) {
        const txn = await CryptoTransactions(postgres).xrpCreateFromEventStream(evt)
        log.info("New wallet transaction", txn)

        const txnType = [ config.ripple.masterAddr, config.ripple.masterClassicAddr ].includes(txn.destination_account_hash)
          ? 'credit'
          : 'debit'

        const userIdAffected = txnType === 'credit' ? txn.destination_user_id : txn.source_user_id
        if (!userIdAffected)
          return log.info(`Didn't find user ID of affected transaction so short-circuiting.`)

        const updatedWallet = await CryptoTransactions(postgres).xrpRefreshUserWallet(userIdAffected)
        io.in(`user_${userIdAffected}`).emit('setUserWallet', { xrp: updatedWallet })

        const priv = PrivacyCards(postgres)
        let [ card, user ] = await Promise.all([
          priv.findBy({ user_id: user.id, is_active: true }),
          Users(postgres).find(userIdAffected)
        ])
        if (!card && wallet && wallet.current_amount > 0)
          card = await priv.createCard(user)

        io.in(`user_${userIdAffected}`).emit(`getPrivacyActiveCard`, card)
      })
    
      log.debug("Subscribe response:", subscribeResponse)
    }
  }
}