import Privacy from './privacy'
import Ripple from './ripple'

export default {
  ...Privacy,
  ...Ripple,

  isLoading: true,
  isLoggedIn: false,
  
  session: {}
}
