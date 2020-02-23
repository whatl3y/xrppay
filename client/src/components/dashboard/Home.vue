<template lang="pug">
  div.row
    div.col-lg-8.offset-lg-2
      div.card.mt-4
        div.card-header
          h4.m-0 1. Send Ripple to this Address
        div.card-body ADDR
        
        div.card-header
          h4.m-0 2. Use Card Info at Merchant
        div.card-body
          div.form-group
            label Card #
            input.form-control.form-control-lg(disabled,v-model="privacyCard.card_number")
          div.row.small-gutters
            div.col-lg-3
              div.form-group
                label Exp Month
                input.form-control(disabled,v-model="privacyCard.exp_month")
            div.col-lg-3
              div.form-group
                label Exp Year
                input.form-control(disabled,v-model="privacyCard.exp_year")
            div.col-lg-6
              div.form-group
                label CVV
                input.form-control(disabled,v-model="privacyCard.cvv")
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    computed: mapState({
      privacyCard: state => state.privacy.card || {}
    }),

    created() {
      this.$socket.emit('rippleGetAddresses')
      this.$socket.emit('privacyGetActiveCard')
    }
  }
</script>
