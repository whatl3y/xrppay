export default {
  async SOCKET_setRippleAddress({ commit }, addressRecord) {
    commit('SET_RIPPLE_ADDRESS', addressRecord)
  }
}
