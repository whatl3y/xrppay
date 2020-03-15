import minimist from 'minimist'
import BigNumber from 'bignumber.js'
import CryptoApi from '../../libs/CryptoApi'
import RippleClient from '../../libs/RippleClient'
import config from '../../config'

const argv = minimist(process.argv.slice(2))
const addr = argv.a

;(async function getBalances() {
  try {
    const api = CryptoApi()
    const res = await RippleClient().getBalances(addr)
    const resWithUsd = await Promise.all(
      res.map(async balance => {
        try {
          const usdExchangeRate = await api.usdSpotPrice(balance.currency)
          return {
            ...balance,
            usdEstimate: new BigNumber(balance.value).times(usdExchangeRate.data.amount).toString()
          }
        } catch(err) {
          return balance
        }
      })
    )
    console.log(`Balance info:`, JSON.stringify(resWithUsd, null, 2))

  } catch(err) {
    console.error(`Error getting balances`, err)
  } finally {
    process.exit()
  }
})()
