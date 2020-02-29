import BigNumber from 'bignumber.js'

export default {
  routeNamespace(state) {
    return state.router.currentRoute.fullPath.split('/')[1]
  },

  getPrivacyCardLimitUsd(state) {
    return new BigNumber(state.privacy.card.spend_limit).dividedBy(100).toFixed(2)
  }
}
