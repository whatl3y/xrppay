import minimist from 'minimist'
import moment from 'moment'
import PostgresClient from '../../libs/PostgresClient'
import RedisHelper from '../../libs/RedisHelper'
import PrivacyAPI from '../../libs/PrivacyAPI'
import CryptoWallet from '../../libs/models/CryptoWallet'
import PrivacyCards from '../../libs/models/PrivacyCards'
import PrivacyCardTransactions from '../../libs/models/PrivacyCardTransactions'
import config from '../../config'

const argv = minimist(process.argv.slice(2))

const lastSyncKey = `privacy_last_card_sync_date`
const postgres = new PostgresClient()
const redis = new RedisHelper()

;(async function syncCardsState() {
  try {
    const startDate = argv.s || await redis.client.get(lastSyncKey)  // OPTIONAL: YYYY-MM-DD
    const cardToken = argv.c  // OPTIONAL: UUID of card

    const privacy = PrivacyAPI(config.privacy.apiKey)

    const transactions = await privacy.listTransactions('all', {
      begin: startDate,
      card_token: cardToken
    })

    for (let i = 0; i < transactions.length; i++) {
      const txn = transactions[i]

      const cards = PrivacyCards(postgres)
      const locTxn = PrivacyCardTransactions(postgres)
      const card = await cards.findBy({ card_token: txn.card.token })
      if (!card)
        continue

      await locTxn.findOrCreateBy({ privacy_card_id: card.id, transaction_token: txn.token })
      locTxn.setRecord({
        amount_cents: txn.amount,
        settled_amount_cents: txn.settled_amount,
        status: txn.status,
        result: txn.result,
        transaction_created_at: txn.created,
        merchant_descriptor: txn.merchant.descriptor,
        merchant_city: txn.merchant.city,
        merchant_state: txn.merchant.state,
        merchant_country: txn.merchant.country
      })
      cards.setRecord({
        id: card.id,
        is_active: false,
        state: txn.card.state,
        spend_limit_duration: txn.card.spend_limit_duration,
        spend_limit: txn.card.spend_limit
      })

      await locTxn.save()

      // If the transaction record is a new one,
      // send money from user's wallet to cold wallet
      if (!locTxn.isNewRecord || locTxn.record.result !== 'APPROVED')
        continue

      const rippleRes = await CryptoWallet(postgres).processTransaction(card.user_id, txn)
      console.log(`Response from sending XRP to cold wallet`, rippleRes)

      // TODO: Refresh affected users wallet balance


      // Save the card info last so we don't prematurely deactivate
      // it before sending XRP to our cold wallet (i.e. allowing
      // the user to potentially spend their wallet balance more
      // than once)
      cards.save()
    }

    await redis.client.set(lastSyncKey, moment().subtract(1, 'day').format('YYYY-MM-DD'), 'EX', 60 * 60)
    console.log("Successfully synced card transactions")

  } catch(err) {
    console.error(`Error syncing cards`, err)
  } finally {
    process.exit()
  }
})()
