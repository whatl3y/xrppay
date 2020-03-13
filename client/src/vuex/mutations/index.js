import moment from 'moment'
import Privacy from './privacy'
import Ripple from './ripple'

export default {
  ...Privacy,
  ...Ripple,

  APP_NO_LONGER_LOADING(state) {
    state.isLoading = false
  },

  CHECK_LOGGED_IN(state, isLoggedIn) {
    state.isLoggedIn = isLoggedIn
  },

  SET_MAIN_NOTIFICATION(state, notification) {
    state.mainNotification = notification
  },

  SET_SESSION(state, sessionObj) {
    state.session = sessionObj
  },

  SET_SYSTEM_CONFIG(state, config) {
    state.systemConfig = config
  },

  SET_CRYPTO_EXCHANGE_PRICE(state, info) {
    const [ type ] = Object.keys(info)
    state.exchangePrices[type] = info[type]
    state.exchangePricesLastUpdated = moment().toDate()
  },

  SET_USER_WALLET(state, walletRecords) {
    Object.keys(walletRecords).forEach(type => {
      state.wallets[type] = walletRecords[type]
    })
  }
}
