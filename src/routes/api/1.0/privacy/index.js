import BigNumber from 'bignumber.js'
import BackgroundWorker from '../../../../libs/BackgroundWorker'
import SessionHandler from '../../../../libs/SessionHandler'
import CryptoApi from '../../../../libs/CryptoApi'
import CryptoWallet from '../../../../libs/models/CryptoWallet'
import PrivacyCards from '../../../../libs/models/PrivacyCards'
import config from '../../../../config'

export default function({ io, postgres, redis }) {
  return {
    // https://developer.privacy.com/docs#transaction-webhooks
    async ['card/transaction'](req, res) {
      const privacyHmacToken = req.headers['x-privacy-hmac']
      // req.body is transaction object
      // https://developer.privacy.com/docs#schema-transaction
      console.log("CARDTRANS", privacyHmacToken, req.body)
      res.json(true)
    },

    async ['card/update'](req, res) {
      const crypto = CryptoApi()
      const session = SessionHandler(req.session, { redis })
      const userId = session.getLoggedInUserId()
      const cryptoType = 'xrp'
      
      const [ exchangeRate, wallet ] = await Promise.all([
        crypto.usdSpotPrice(cryptoType),
        CryptoWallet(postgres).findBy({ user_id: userId, type: cryptoType })
      ])

      const currentAmountInWallet = new BigNumber(wallet.current_amount)
      const amountDollarsPerCurrency = new BigNumber(exchangeRate.data.amount)

      const amountUsdToAddToCard = currentAmountInWallet
        .times(amountDollarsPerCurrency)
        .times(config.percentPerTransaction)
      const amountUsdCents = parseInt(amountUsdToAddToCard.times(100).integerValue(BigNumber.ROUND_DOWN))

      const newCardInfo = await PrivacyCards(postgres).updateCard(userId, { limit: amountUsdCents })
      await Promise.all([
        BackgroundWorker({ redis }).enqueueIn(10 * 60 * 1e3, 'privacyLockCard', { userId }),
        redis.client.set(
          `burner_card_expiration_key_${userId}`,
          'true', 
          'EX', 
          10 * 60)  // 10 minutes
      ])

      io.in(`user_${userId}`).emit(`getPrivacyActiveCard`, newCardInfo)
      io.in(`user_${userId}`).emit('privacyActiveCardExpiration', 10 * 60)
      res.json(true)
    }
  }
}