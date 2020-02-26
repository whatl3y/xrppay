import RippleClient from '../libs/RippleClient'
import SessionHandler from '../libs/SessionHandler'
import UserWallets from '../libs/models/UserWallets'
import XrplTransactions from '../libs/models/XrplTransactions'
import { arrayGroupBy } from '../libs/Helpers'
// import config from '../config'

export default function Wallets({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })
  const userId = session.getLoggedInUserId()

  return {
    async refreshUserWallet(walletType) {
      // TODO: need to abstract this and support more wallet types in the future
      if (walletType === 'xrp') {
        const ripple = RippleClient()
        const { credits, debits } = await XrplTransactions(postgres).getTransactionsForUser(userId)
        const updatedWallet = await UserWallets(postgres).resetBalancefromAllDebitsAndCredits(userId, walletType, [
          ...credits.map(txn => ({ debitOrCredit: 'credit', amountAbsValue: ripple.client.dropsToXrp(txn.amount_drops) })),
          ...debits.map(txn => ({ debitOrCredit: 'debit', amountAbsValue: ripple.client.dropsToXrp((parseFloat(txn.amount_drops || 0) + parseFloat(txn.fee_drops || 0)).toString()) }))
        ])

        socket.emit('setUserWallet', { xrp: updatedWallet })
      }
    },

    async walletGetUserWallets() {
      const wallets = UserWallets(postgres)
      let userWallets = await wallets.getAllBy({ user_id: userId })
      if (userWallets.length === 0) {
        await wallets.findOrCreateBy({ user_id: userId, type: 'xrp' })
        userWallets = await wallets.getAllBy({ user_id: userId })
      }

      const walletsByType = arrayGroupBy(userWallets, w => w.type)
      const singleWalletsByType = Object.keys(walletsByType).reduce((obj, walletType) => {
        return {
          ...obj,
          [walletType]: walletsByType[walletType][0]
        }
      }, {})

      socket.emit(`setUserWallet`, singleWalletsByType)
    }
  }
}
