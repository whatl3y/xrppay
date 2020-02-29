import minimist from 'minimist'
import PostgresClient from '../../libs/PostgresClient'
import PrivacyAPI from '../../libs/PrivacyAPI'
// import XrplTransactions from '../../libs/models/XrplTransactions'
import config from '../../config'

const argv = minimist(process.argv.slice(2))
const merchant = argv.m || 'Example Merchant'
const amountUsd = argv.a
const cardNum = argv.c

const postgres = new PostgresClient()

;(async function simulateTransaction() {
  try {
    const response = await PrivacyAPI(config.privacy.apiKey).simulateAuthorization(cardNum, merchant, amountUsd)
    console.log("Successfully simulated transaction:", response)

  } catch(err) {
    console.error(`Error backfilling transactions`, err)
  } finally {
    process.exit()
  }
})()