import crypto from 'crypto'
import stringify from 'json-stable-stringify'
import PrivacyAPI from '../../libs/PrivacyAPI'
import config from '../../config'

;(function testPrivacyHmac() {
  try {
    const providedToken = 'V5cCO6iWwE57kDDjQzfIusqJhm9QLt6gOKh1U+7gwwU='
    const txnObj = {
      amount: 600,
      status: 'PENDING',
      result: 'APPROVED',
      settled_amount: 0,
      created: '2020-03-06T15:39:55Z',
      merchant: {
        descriptor: 'Example Merchant',
        city: 'NEW YORK',
        state: 'NY',
        country: 'USA',
        mcc: '5812',
        acceptor_id: '174030075991'
      },
      card: {
        created: '2020-03-06T15:23:07Z',
        token: '640dbff4-7ce3-4451-8d3e-a3f76be30059',
        last_four: '8160',
        hostname: '',
        memo: "whatl3y@gmail.com's Card",
        type: 'SINGLE_USE',
        spend_limit: 8950,
        spend_limit_duration: 'FOREVER',
        state: 'OPEN',
        funding: {
          account_name: 'Sandbox',
          token: 'e2c7d3ce-a976-44ef-9d09-a1b111b82020',
          type: 'DEPOSITORY_CHECKING'
        },
        pan: '4111111189548160',
        cvv: '879',
        exp_month: '03',
        exp_year: '2026'
      },
      token: 'f3b32892-778a-4b7c-9865-54d61f53d7fc',
      events: [
        {
          type: 'AUTHORIZATION',
          token: '468e681c-6f52-4534-a890-9832c13ea4ea',
          created: '2020-03-06T15:39:55Z',
          amount: 600,
          result: 'APPROVED'
        }
      ],
      funding: [
        {
          type: 'DEPOSITORY_CHECKING',
          amount: 600,
          token: 'e2c7d3ce-a976-44ef-9d09-a1b111b82020'
        }
      ]
    }

    const privacy = PrivacyAPI(config.privacy.apiKey)
    const generatedHmac = privacy.generateHmac(stringify(txnObj))

    console.log(
      "Test privacy HMAC results",
      providedToken,
      generatedHmac,
      crypto.timingSafeEqual(Buffer.from(generatedHmac), Buffer.from(providedToken)))

  } catch(err) {
    console.error(`Error testing HMAC`, err)
  } finally {
    process.exit()
  }
})()
