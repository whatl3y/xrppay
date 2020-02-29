// import BigNumber from 'bignumber.js'
// import SessionHandler from '../../../../libs/SessionHandler'
// import PrivacyCards from '../../../../libs/models/PrivacyCards'
// import config from '../../../../config'

export default function({ io, log, postgres, redis }) {
  return {
    // https://developer.privacy.com/docs#transaction-webhooks
    async ['card/transaction'](req, res) {
      const privacyHmacToken = req.headers['x-privacy-hmac']
      // req.body is transaction object
      // https://developer.privacy.com/docs#schema-transaction
      console.log("CARDTRANS", privacyHmacToken, req.body)
      res.json(true)
    }
  }
}