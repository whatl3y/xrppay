<template lang="pug">
  form(@submit="submitPasswordReset")
    div(v-if="user.password_hash")
      div.form-group
        label(for="cur-pw") Current Password
        input.form-control(name="cur-pw",type="password",v-model="curPw",size="sm",autocomplete="current-password")
      hr
    div.form-group
      label(for="new-pw") New Password
      input.form-control(name="new-pw",type="password",v-model="newPw",size="sm",autocomplete="new-password")
    div.form-group
      label(for="new-pw-conf") Confirm New Password
      input.form-control(name="new-pw-conf",type="password",v-model="newPwConf",size="sm",autocomplete="new-password-confirm")
    div.text-center
      button.btn.btn-primary(type="submit")
        span Submit
        loader-inline.ml-1(v-if="isLoadingLocal")
    div.alert.alert-danger.mt-2(v-if="!!error") {{ error }}
    div.alert.alert-success.mt-2(v-if="!error && !!success") Successfully reset your password!
</template>

<script>
  import { mapState } from 'vuex'
  import ApiAuth from '../../factories/ApiAuth'

  export default {
    data() {
      return {
        error: null,
        success: false,
        isLoadingLocal: false,
        curPw: null,
        newPw: null,
        newPwConf: null
      }
    },

    computed: mapState({
      user: state => state.session.user
    }),

    methods: {
      doPasswordsMatch() {
        return this.newPw && this.newPw.length > 0 && this.newPw === this.newPwConf
      },

      async submitPasswordReset(evt) {
        try {
          evt.preventDefault()
          this.error = null

          if (!this.newPw)
            return this.error = `Enter a new password to reset it.`

          if (!this.doPasswordsMatch())
            return this.error = `Make sure you enter a new password and it matches with the confirmed password and try again.`

          this.isLoadingLocal = true
          await ApiAuth.resetPassword({ current_password: this.curPw, new_password: this.newPw })

          this.curPw = this.newPw = this.newPwConf = this.error = null
          this.$emit('reset')
          this.success = true

        } catch(err) {
          this.error = err.message
        } finally {
          this.isLoadingLocal = false
        }
      }
    }
  }
</script>
