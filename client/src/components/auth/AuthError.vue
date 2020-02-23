<template lang="pug">
  div
    div.row.text-center
      div.col-lg-8.offset-lg-2
        div.alert.alert-danger.text-center.mb-0.mt-4(v-if="!!errorMessage") {{ errorMessage }}
    component(:is="subComponent")
</template>

<script>
  import ErrorMessages from '../../factories/ErrorMessages'
  import Login from './Login'

  export default {
    props: {
      error: { type: String, required: true }
    },

    data() {
      return {
        errorMessage: null,
        subComponent: 'login'
      }
    },

    created() {
      this.errorMessage = ((ErrorMessages[this.error].toString() === '[object Object]') ? ErrorMessages[this.error].error : ErrorMessages[this.error])
      this.subComponent = (ErrorMessages[this.error].toString() === '[object Object]') ? ErrorMessages[this.error].component : this.subComponent

      // Force entering `false` as the error message if you don't want
      // the alert to show with the default message.
      if (!this.errorMessage && this.errorMessage !== false)
        this.errorMessage = 'There was an error with your request. Please try again.'
    },

    components: {
      Login
    }
  }
</script>
