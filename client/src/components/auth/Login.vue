<template lang="pug">
  div.row
    div.col-lg-4.offset-lg-4
      form(action="/auth/local",method="post")
        div.card.mt-4
          div.card-header Login
          div.card-body
            div.form-group
              label(for="username") Email Address
              input#username.form-control(name="username")
            div.form-group
              label(for="password") Password
              input#password.form-control(name="password",type="password")
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
    }
  }
</script>
