import crypto from 'crypto'
import BigNumber from 'bignumber.js'
import stringify from 'json-stable-stringify'
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

      const generatedHmac = privacy.generateHmac(stringify(transactionObject))
      if (!crypto.timingSafeEqual(Buffer.from(generatedHmac), Buffer.from(privacyHmacToken))) {
        log.error(`HMAC token from Privacy transaction doesn't match`, privacyHmacToken, generatedHmac, req.body)
        return res.sendStatus(400)
      }

      const card = await cards.findBy({ card_token: transactionObject.card.token })
      if (!card) {
        log.info(`No user with card of transaction provided`, req.body)
        return res.json(true)
      }

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

      await txnInst.save()

      // If the transaction record is a new one,
      // send money from user's wallet to cold wallet
      if (!txnInst.isNewRecord || txnInst.record.result !== 'APPROVED')
        return res.json(true)

      const rippleRes = await CryptoWallet(postgres).processTransaction(card.user_id, transactionObject)
      log.info(`Response from sending XRP to cold wallet`, rippleRes)

      // Save the card info last so we don't prematurely deactivate
      // it before sending XRP to our cold wallet (i.e. allowing
      // the user to potentially spend their wallet balance more
      // than once)
      await cards.save()

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
        .times(config.systemConfig.percentPerTransaction)
      const amountUsdCents = amountUsdToAddToCard.times(100)
      const amountMaxPerTxnCents = new BigNumber(config.systemConfig.maxmimumPerTransaction).times(100)
      const finalAmountUsdCents = BigNumber.minimum(amountUsdCents, amountMaxPerTxnCents).integerValue(BigNumber.ROUND_DOWN)

      const newCardInfo = await PrivacyCards(postgres).updateCard(userId, { limit: finalAmountUsdCents.toNumber() })
      await Promise.all([
        BackgroundWorker({ redis }).enqueueIn(10 * 60 * 1e3, 'privacyLockCard', { cardId: newCardInfo.id, userId }),
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