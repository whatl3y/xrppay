export default {
  SOCKET_getPrivacyActiveCard({ commit }, card) {
    commit('SET_PRIVACY_ACTIVE_CARD', card)
  },

  SOCKET_privacyActiveCardExpiration({ commit }, expirationTime) {
    commit('SET_PRIVACY_CARD_EXPIRATION_TIME', expirationTime)
  }
}
