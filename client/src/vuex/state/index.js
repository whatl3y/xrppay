import Privacy from './privacy'
import Ripple from './ripple'

export default {
  ...Privacy,
  ...Ripple,

  isLoading: true,
  isLoggedIn: false,
  mainNotification: null,
  
  session: {},

  systemConfig: {
    maxmimumPerTransaction: null,
    percentPerTransaction: null
  },

  exchangePrices: {
    btc: null,
    eth: null,
    xrp: null
  },
  exchangePricesLastUpdated: new Date(),

  wallets: {
    xrp: null
  },

  calculateAmountUsd(currencyCode, amountCurrency) {
    return (this.exchangePrices[currencyCode] || 0) * amountCurrency
  }
}
