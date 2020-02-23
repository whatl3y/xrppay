<template lang="pug">
  div#app.container-fluid.h-100
    div.main-navbar.sticky-top.bg-white.border-bottom.row
      app-top-navbar.w-100
    div.container
      router-view#main-content

    reset-password-modal(@reset="resetSession")
</template>

<script>
  import { mapState } from 'vuex'
  import $ from 'jquery'
  // import XrppaySocket from '../factories/XrppaySocket'
  import AppTopNavbar from './AppTopNavbar'
  import ResetPasswordModal from './auth/ResetPasswordModal'

  export default {
    name: 'xrppay',

    computed: mapState({
      user: state => state.session.user
    }),

    watch: {
      $route(/*to, from*/) {
        this.$socket.emit('globalUpdatePagePath', this.$router.currentRoute.fullPath)
      }
    },

    methods: {
      async resetSession() {
        await this.$store.dispatch('getUserSession', true)
      }
    },

    async created() {
      // XrppaySocket.on('connect', () =>  this.subscribeXrppaySocket())
      // XrppaySocket.on('connect_error', console.error)
      // XrppaySocket.on('error', console.error)
      // XrppaySocket.on('disconnect', () => XrppaySocket.open())
      
      await this.$store.dispatch('init')

      if (this.user && this.user.needs_password_reset)
        $("#reset-password-modal").modal()

      this.$socket.emit('globalSubscribe', this.$router.currentRoute.fullPath)
    },

    components: {
      AppTopNavbar,
      ResetPasswordModal
    }
  }
</script>