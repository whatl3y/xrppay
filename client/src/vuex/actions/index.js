import Privacy from './privacy'
import Ripple from './ripple'
import ApiAuth from '../../factories/ApiAuth'

export default {
  ...Privacy,
  ...Ripple,

  async init({ commit, dispatch, state }) {
    await dispatch('getUserSession')

    const fullPath = state.router.currentRoute.fullPath
    const isLoggedIn = !!(state.session.user)
    commit('CHECK_LOGGED_IN', isLoggedIn)
    if (isLoggedIn) {
      if (!state.session.user.is_verified) {
        if (!/^\/verification\//.test(fullPath)) {
          state.router.push('/verification/pending')
          return commit('APP_NO_LONGER_LOADING')
        }
      } else {
        // Uses window.location.href redirect in order to intiate all init
        // actions again since vueRouter.push will not call init actions
        if (/^\/login/.test(fullPath)) {
          return window.location.href = '/' // return state.router.push('/')
        }
      }
    } else {
      if (!(/^\/login/.test(fullPath) || /^\/autherror/.test(fullPath) || /^\/mfa/.test(fullPath))) {
        state.router.push('/login')
        return commit('APP_NO_LONGER_LOADING')
      }

      return commit('APP_NO_LONGER_LOADING')
    }

    commit('APP_NO_LONGER_LOADING')
  },

  async getUserSession({ commit, state }, reset=false) {
    if (state.session && state.session.user && !reset)
      return { session: state.session }

    const { session } = await ApiAuth.getSession()
    commit('SET_SESSION', session)
  },

  SOCKET_mainNotification({ commit }, notification) {
    commit('SET_MAIN_NOTIFICATION', notification)
  },

  SOCKET_setSystemConfig({ commit }, config) {
    commit('SET_SYSTEM_CONFIG', config)
  },

  SOCKET_setUserWallet({ commit }, walletRecord) {
    // window.toastr.success(`Your wallet balance was updated.`)
    commit('SET_USER_WALLET', walletRecord)
  },

  SOCKET_setSpotPrice({ commit }, info) {
    commit('SET_CRYPTO_EXCHANGE_PRICE', info)
  }
}
