export default {
  async SOCKET_setMaximumTransaction({ commit }, max) {
    commit('SET_PRIVACY_MAX_TRANSACTION', parseFloat(max).toFixed(2))
  },

  async SOCKET_getPrivacyActiveCard({ commit }, card) {
    commit('SET_PRIVACY_ACTIVE_CARD', card)
  }
}
