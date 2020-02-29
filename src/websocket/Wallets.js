import BigNumber from 'bignumber.js'
// import RippleClient from '../libs/RippleClient'
import SessionHandler from '../libs/SessionHandler'
import CryptoWallet from '../libs/models/CryptoWallet'
import PrivacyCards from '../libs/models/PrivacyCards'
import XrplTransactions from '../libs/models/XrplTransactions'
import { arrayGroupBy } from '../libs/Helpers'
// import config from '../config'

export default function Wallets({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })
  const user = session.getLoggedInUserId(true)

  return {
    async refreshUserWallet(walletType) {
      // TODO: need to abstract this and support more wallet types in the future
      if (walletType === 'xrp') {
        const updatedWallet = await XrplTransactions(postgres).refreshUserWallet(user.id)
        socket.emit('setUserWallet', { xrp: updatedWallet })

        const currentAmount = new BigNumber(updatedWallet.current_amount)
        if (currentAmount.isGreaterThanOrEqualTo(1)) {
          const priv = PrivacyCards(postgres)
          let card = await priv.findBy({ user_id: user.id, is_active: true })
          if (!card) {
            card = await priv.createCard(user)
            socket.emit(`getPrivacyActiveCard`, card)
          }
        }
      }
    },

    async walletGetUserWallets() {
      const wallets = CryptoWallet(postgres)
      let userWallets = await wallets.getAllBy({ user_id: user.id })
      if (userWallets.length === 0) {
        await wallets.findOrCreateBy({ user_id: user.id, type: 'xrp' })
        userWallets = await wallets.getAllBy({ user_id: user.id })
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
