<template lang="pug">
  div.row
    div.col-lg-6.offset-lg-3
      div.card.mt-4
        div.card-body
          div.text-right.d-flex.align-items-center
            div.ml-auto
              div Balance:
              div.text-large 0 XRP ($0 USD)
      div.card.mt-4
        div.card-header
          h4.m-0 1. Send Ripple to this Address
        div.card-body ADDR
        
        div.card-header
          h4.m-0 2. Use Card Info at Merchant
        div.card-body
          div.row.small-gutters
            div.col-lg-12
              div.form-group
                label Card #
                div.text-large
                  strong {{ cardNumber }}
            div.col-lg-4
              div.form-group
                label Exp Month
                div.text-large
                  strong {{ privacyCard.exp_month }}
            div.col-lg-4
              div.form-group
                label Exp Year
                div.text-large
                  strong {{ privacyCard.exp_year }}
            div.col-lg-4
              div.form-group
                label CVV
                div.text-large
                  strong {{ privacyCard.cvv }}
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    computed: {
      ...mapState({
        privacyCard: state => state.privacy.card || {}
      }),

      cardNumber() {
        return ((this.privacyCard.card_number || '').match(/\d{4}/g) || []).join(' ')
      }
    },

    created() {
      this.$socket.emit('rippleGetAddresses')
      this.$socket.emit('privacyGetActiveCard')
    }
  }
</script>
