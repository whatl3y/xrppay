// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import $ from 'jquery'
import "bootstrap"
import toastr from 'toastr'
import * as FastClick from 'fastclick'
import VueSocketIO from 'vue-socket.io'
import store from './vuex/store'
import App from './components/App'
import XrppaySocket from './factories/XrppaySocket'
import router from './router'

// external libraries and components
import './components/reusable'

// css
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './css/app.scss'

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: XrppaySocket,
    vuex: {
      store,
      actionPrefix: "SOCKET_",
      mutationPrefix: ""
    }
  })
)

// Initiate FastClick for mobile devices to remove the built-in 300ms
// delay. Read more in https://github.com/ftlabs/fastclick
if ('addEventListener' in document)
  document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body), false)

window.toastr = toastr
window.toastr.options.positionClass = 'toast-bottom-right'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  store,
  el: '#xrppay',
  router,
  template: '<App/>',
  components: { App }
})
