import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import state from './state'
import router from '../router'

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  getters,
  mutations,
  state: {
    ...state,
    router
  }
})
