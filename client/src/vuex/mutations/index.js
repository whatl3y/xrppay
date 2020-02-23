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

  SET_SESSION(state, sessionObj) {
    state.session = sessionObj
  }
}
