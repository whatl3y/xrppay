<template lang="pug">
  div.row.d-flex.justify-content-center
    div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-6.col-lg-offset-3
      div.alert.alert-danger.text-center.mt-4
        div.
          Your account has not been verified yet. Please check your email and
          follow the verification link to begin using xrppay.
        div.text-center.margin-top-large
          a(@click="resendVerificationLink()")
            h4.text-danger.mt-3.mb-0
              u Resend Verification Link
</template>

<script>
  import ApiAuth from '../../factories/ApiAuth'

  export default {
    props: [ 'type' ],

    methods: {
      async resendVerificationLink() {
        try {
          await ApiAuth.resendVerification()
          window.toastr.success('Successfully resent your verification link. Please check your e-mail and follow the link provided.')
        } catch(err) {
          window.toastr.error(err.message)
        }
      }
    }
  }
</script>
