<template lang="pug">
  div#app.container-fluid.h-100
    div.main-navbar.sticky-top.bg-white.border-bottom.row
      app-top-navbar.w-100
      div.w-100.alert.alert-danger.text-center.rounded-0.mb-0(
        v-if="mainNotification",
        v-html="mainNotification")
    div.container
      loader(v-if="isLoading")
      router-view#main-content(v-else)

    reset-password-modal(@reset="resetSession")
</template>

<script>
  import { mapState } from 'vuex'
  import $ from 'jquery'
  import AppTopNavbar from './AppTopNavbar'
  import ResetPasswordModal from './auth/ResetPasswordModal'

  export default {
    name: 'xrppay',

    computed: mapState({
      isLoading: state => state.isLoading,
      mainNotification: state => state.mainNotification,
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