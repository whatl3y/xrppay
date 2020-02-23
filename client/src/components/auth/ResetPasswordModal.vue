<template lang="pug">
  div#reset-password-modal.modal.fade(v-if="user",tabindex="-1",role="dialog",aria-labelledby="reset-password-modal-label",aria-hidden="true")
    div.modal-dialog(role="document")
      div.modal-content
        div.modal-header
          h5#reset-password-modal-label.modal-title Reset Password
          button.close(type="button",data-dismiss="modal",aria-label="Close")
            span(aria-hidden="true") &times;
        div.modal-body
          reset-password-form(@reset="resetSuccessful()")
          div.text-center.mt-3
            a(@click="showPasswordRequirements = !showPasswordRequirements") {{ (showPasswordRequirements) ? 'Hide' : 'Show' }} password requirements
          div(v-if="showPasswordRequirements")
            hr
            password-requirements-card
</template>

<script>
  import { mapState } from 'vuex'
  import $ from 'jquery'
  import PasswordRequirementsCard from './PasswordRequirementsCard'
  import ResetPasswordForm from './ResetPasswordForm'
  import { sleep } from '../../factories/Utilities'

  export default {
    data() {
      return {
        showPasswordRequirements: false
      }
    },

    computed: mapState({
      user: state => state.session.user
    }),

    methods: {
      async resetSuccessful() {
        this.$emit('reset')
        await sleep(1000)
        $( '#reset-password-modal' ).modal('toggle')
      }
    },

    components: {
      PasswordRequirementsCard,
      ResetPasswordForm
    }
  }
</script>
