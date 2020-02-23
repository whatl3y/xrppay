export default {
  async SOCKET_getRippleAddresses({ commit }, addresses) {
    commit('SET_RIPPLE_ADDRESSES', addresses)
  }
}
