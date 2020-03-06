<template lang="pug">
  div.modal.fade(tabindex="-1",role="dialog",aria-labelledby="send-xrp-modal",aria-hidden="true")
    div.modal-dialog(role="document")
      div.modal-content
        form(@submit="sendXrp")
          div.modal-header
            h5#send-xrp-modal.modal-title Send Ripple
            button.close(type="button",data-dismiss="modal",aria-label="Close")
              span(aria-hidden="true") &times;
          div.modal-body
            - // TODO: Need to show "Lock card" button/notice if there is an Active
            - // privacy card for this user, then lock before allowing user to
            - // send XRP outbound. Also need validation on the backend that there
            - // are no active cards before sending
            div.form-group
              label(for="send-xrp-address") Destination Ripple Address
              input#send-xrp-address.form-control(v-model="address")
            div.form-group
              label(for="send-xrp-tag") Tag
              input#send-xrp-tag.form-control(v-model="tag")
            div.form-group
              label(for="send-xrp-amount") Amount XRP to Send (up to #[strong {{ userXrpWalletCurrentAmount }} XRP])
              input#send-xrp-amount.form-control(v-model="amountXrp")
          div.modal-footer
            button.btn.btn-secondary(type="button",data-dismiss="modal") Cancel
            button.btn.btn-primary(v-if="!isPendingSend",type="submit") Send XRP
            loader-inline(v-else)
</template>

<script>
  import $ from 'jquery'
  import BigNumber from 'bignumber.js'
  import { mapState } from 'vuex'
  import ApiRipple from '../../factories/ApiRipple'

  export default {
    data() {
      return defaultData()
    },

    computed: mapState({
      userXrpWalletCurrentAmount(state) {
        return new BigNumber((state.wallets.xrp || {}).current_amount).toFixed(2)
      }
    }),

    methods: {
      async sendXrp(evt) {
        try {
          evt.preventDefault()

          if (!this.tag)
            return window.toastr.error(`The Ripple destination tag is required to send XRP. Make sure you specify the tag to send XRP.`)

          if (!(this.address && this.amountXrp))
            return window.toastr.error(`Make sure you specify a valid address and amount of XRP to send.`)

          this.isPendingSend = true
          await ApiRipple.sendXrp({
            addr: this.address,
            tag: this.tag,
            amount: this.amountXrp
          })
          window.toastr.success(`Successfully initiated a request to send XRP to the ${this.address}.`)
          $( `#${this.$el.id}` ).modal('hide')
          Object.assign(this.$data, defaultData())

        } catch(err) {
          window.toastr.error(err.message)
        } finally {
          this.isPendingSend = false
        }
      }
    }
  }

  function defaultData() {
    return {
      address: null,
      tag: null,
      amountXrp: null,

      isPendingSend: false
    }
  }
</script>
