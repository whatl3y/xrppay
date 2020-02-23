export default {
  async SOCKET_getPrivacyActiveCard({ commit }, card) {
    commit('SET_PRIVACY_ACTIVE_CARD', card)
  }
}
