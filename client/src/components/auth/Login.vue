<template lang="pug">
  div.row
    div.col-lg-4.offset-lg-4
      form(:action="getFormAction",method="post")
        div.card.mt-4
          div.card-header Login
          div.card-body
            div.form-group
              label
                input(type="checkbox",v-model="createAccount")
                span.ml-1 Create new account?
            div.form-group
              label(for="username") Email Address
              input#username.form-control(name="username")
            div.form-group
              label(for="password") Password
              input#password.form-control(name="password",type="password")
            div.form-group(v-if="createAccount")
              label(for="cpassword") Confirm Password
              input#cpassword.form-control(name="cpassword",type="password")
            div.form-group.text-center
              button.btn.btn-primary Login
            hr
            div.form-group.small.text-center
              a(data-toggle="modal",data-target="#forgot-password-modal") Forgot password?

    forgot-password-modal#forgot-password-modal
</template>

<script>
  import ForgotPasswordModal from './ForgotPasswordModal'

  export default {
    components: {
      ForgotPasswordModal
    },

    data() {
      return {
        createAccount: false
      }
    },

    computed: {
      getFormAction() {
        return this.createAccount
          ? '/api/1.0/auth/create/user'
          : '/auth/local'
      }
    }
  }
</script>
