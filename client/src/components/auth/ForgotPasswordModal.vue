<template lang="pug">
  div.modal.fade(tabindex="-1",role="dialog",aria-labelledby="forgot-password-modal-label",aria-hidden="true")
    div.modal-dialog(role="document")
      div.modal-content
        form(@submit="forgotPassword")
          div.modal-header
            h5#forgot-password-modal-label.modal-title Forgot Password
            button.close(type="button",data-dismiss="modal",aria-label="Close")
              span(aria-hidden="true") &times;
          div.modal-body
            div.alert.alert-danger.margin-bottom-medium(v-if="!!forgot.error && !forgot.success") {{ forgot.error }}
            div.alert.alert-success.margin-bottom-medium(v-if="!!forgot.success") {{ forgot.success }}
            div.form-group
              label(for="username") Email Address
              input.form-control(v-model="forgot.email")
          div.modal-footer
            button.btn.btn-secondary(type="button",data-dismiss="modal") Cancel
            button.btn.btn-primary(type="submit") Create Temp Password
</template>

<script>
  import $ from 'jquery'
  import ApiAuth from '../../factories/ApiAuth'

  export default {
    data() {
      return {
        forgot: {
          email: null,
          error: null,
          success: null
        }
      }
    },

    methods: {
      async forgotPassword(evt) {
        try {
          evt.preventDefault()

          if (!ApiAuth.isValidEmail(this.forgot.email))
            return this.forgot.error = `Please enter a valid e-mail address to send a temporary password to.`

          this.forgot.success = null
          this.forgot.error = null
          await ApiAuth.forgotPassword(this.forgot.email)
          this.forgot.success = `Success! Check your email shortly for your temporary password to login.`
          setTimeout(() => {
            $("#forgot-password-modal").modal("hide")
            this.forgot.error = this.forgot.success = null
          }, 1500)
        } catch(err) {
          this.forgot.error = err.message
        }
      }
    }
  }
</script>
