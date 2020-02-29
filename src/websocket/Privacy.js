import BigNumber from 'bignumber.js'
import SessionHandler from '../libs/SessionHandler'
import PrivacyCards from '../libs/models/PrivacyCards'
import CryptoWallet from '../libs/models/CryptoWallet'
import config from '../config'

export default function Privacy({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })

  return {
    async getMaximumSpendPerTransaction() {
      socket.emit('setMaximumTransaction', config.privacy.maxmimumPerTransaction)
    },

    async privacyGetActiveCard() {
      const user = session.getLoggedInUserId(true)
      const priv = PrivacyCards(postgres)
      const wallets = CryptoWallet(postgres)

      let [
        card,
        wallet
      ] = await Promise.all([
        priv.findBy({ user_id: user.id, is_active: true }),
        wallets.findBy({ user_id: user.id, type: 'xrp' })
      ])
      const currentAmount = wallet && new BigNumber(wallet.current_amount)

      // initialize user's first card
      if (!card && wallet && currentAmount.isGreaterThan(0))
        card = await priv.createCard(user)

      socket.emit(`getPrivacyActiveCard`, card)
    }
  }
}
