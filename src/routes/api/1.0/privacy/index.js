import BigNumber from 'bignumber.js'
import BackgroundWorker from '../../../../libs/BackgroundWorker'
import SessionHandler from '../../../../libs/SessionHandler'
import CryptoApi from '../../../../libs/CryptoApi'
import PrivacyAPI from '../../../../libs/PrivacyAPI'
import CryptoWallet from '../../../../libs/models/CryptoWallet'
import PrivacyCards from '../../../../libs/models/PrivacyCards'
import PrivacyCardTransactions from '../../../../libs/models/PrivacyCardTransactions'
import config from '../../../../config'

const privacy = PrivacyAPI(config.privacy.apiKey)

export default function({ io, log, postgres, redis }) {
  return {
    // https://developer.privacy.com/docs#transaction-webhooks
    async ['card/transaction'](req, res) {
      const cards = PrivacyCards(postgres)
      const txnInst = PrivacyCardTransactions(postgres)
      const privacyHmacToken = req.headers['x-privacy-hmac']

      // https://developer.privacy.com/docs#schema-transaction
      const transactionObject = req.body

      const generatedHmac = privacy.generateHmac(transactionObject)
      if (generatedHmac !== privacyHmacToken) {
        log.error(`HMAC token from Privacy transaction doesn't match`, privacyHmacToken, generatedHmac, req.body)
        return res.sendStatus(400)
      }

      const card = await cards.findBy({ card_token: transactionObject.card.token })
      await txnInst.findOrCreateBy({ privacy_card_id: card.id, transaction_token: transactionObject.token })

      txnInst.setRecord({
        amount_cents: transactionObject.amount,
        settled_amount_cents: transactionObject.settled_amount,
        status: transactionObject.status,
        result: transactionObject.result,
        transaction_created_at: transactionObject.created,
        merchant_descriptor: transactionObject.merchant.descriptor,
        merchant_city: transactionObject.merchant.city,
        merchant_state: transactionObject.merchant.state,
        merchant_country: transactionObject.merchant.country
      })
      cards.setRecord({
        id: card.id,
        is_active: false,
        state: transactionObject.card.state,
        spend_limit_duration: transactionObject.card.spend_limit_duration,
        spend_limit: transactionObject.card.spend_limit
      })

      await Promise.all([
        txnInst.save(),
        cards.save()
      ])

      // If the transaction record is a new one,
      // send money from user's wallet to cold wallet
      if (!txnInst.isNewRecord)
        return res.json(true)

      const rippleRes = await CryptoWallet(postgres).processTransaction(card.user_id, transactionObject)
      log.info(`Response from sending XRP to cold wallet`, rippleRes)

      io.in(`user_${card.user_id}`).emit('refresh')
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