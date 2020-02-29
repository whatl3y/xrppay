export default {
  SOCKET_setMaximumTransaction({ commit }, max) {
    commit('SET_PRIVACY_MAX_TRANSACTION', parseFloat(max).toFixed(2))
  },

  SOCKET_getPrivacyActiveCard({ commit }, card) {
    commit('SET_PRIVACY_ACTIVE_CARD', card)
  },

  SOCKET_privacyActiveCardExpiration({ commit }, expirationTime) {
    commit('SET_PRIVACY_CARD_EXPIRATION_TIME', expirationTime)
  }
}
