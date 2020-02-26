<template lang="pug">
  div.row
    div.col-lg-8.offset-lg-2.my-4
      div.card
        div.card-body
          div.d-flex.align-items-start
            div
              div Wallet Balance: #[i#refresh-wallet.clickable.fa.fa-sync-alt(@click="refreshWallet")]
              div.text-large {{ (userXrpWallet.current_amount || 0).toFixed(4) }} XRP ≈ ${{ currentAmountUsd }} USD

              b-tooltip(target="refresh-wallet",placement="rightbottom")
                | Is your wallet missing a credit or debit you expect to see? We have background workers
                | running constantly to ensure the integrity and accuracy of all balances,
                | but you can force an off-schedule automated review of your wallet balance by
                | clicking here.
            div.ml-auto.text-right.small
              div #[i#exchange-rate-info.fa.fa-info-circle] Exchange Rate
              div 1 XRP ≈ ${{ xrpExchangePrice || 'N/A' }} USD
              div.small Updated {{ exchangeUpdated }}

              b-tooltip(target="exchange-rate-info")
                | We use Coinbase's spot price as the exchange rate between fiat and cryptocurrencies.
                | This price usually sits somewhere between the buy and sell price at any point in time
                | on Coinbase.
      div.card.mt-4
        div.card-header
          h4.m-0 1. Fund Your Account
        div.card-body
          div.mb-2 Send Ripple (XRP) to this address &amp; tag combo.
          div.alert.alert-warning
            | NOTE: Make sure you include the tag when sending XRP to this address.
            | If you send XRP without specifying the tag below we cannot fund your account.

          div
            div.text-center
              div.row
                div.col-lg-8.offset-lg-2
                  div.form-group
                    label XRP Address
                    div
                      code.p-1 {{ xrpAddress.mod2 }}
                  div.form-group
                    label XRP Tag
                    div
                      code.p-1 {{ xrpAddress.mod1 }}
        
        div.card-header
          h4.m-0 2. Use Card Info at Merchant
        div.card-body
          div(v-if="!privacyCard")
            div.alert.alert-warning.mb-0
              | No active card available to use at a merchant. Once you fund your
              | account we will automatically create a card for you to use at
              | your merchant of choice.
          div.row.small-gutters(v-else)
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
  import moment from 'moment'

  export default {
    data() {
      return {
        spotPriceInterval: null
      }
    },

    computed: {
      ...mapState({
        privacyCard: state => state.privacy.card,
        xrpAddress: state => state.ripple.address,
        xrpExchangePrice: state => state.exchangePrices.xrp,
        exchangeUpdated: state => moment(state.exchangePricesLastUpdated).format('h:mm:ss a'),
        userXrpWallet: state => state.wallets.xrp || {},

        currentAmountUsd(state) {
          return state.calculateAmountUsd('xrp', this.userXrpWallet.current_amount || 0).toFixed(2)
        }
      }),

      cardNumber() {
        return ((this.privacyCard.card_number || '').match(/\d{4}/g) || []).join(' ')
      }
    },

    methods: {
      refreshWallet() {
        this.$socket.emit('refreshUserWallet', 'xrp')
        window.toastr.success(`Sit tight, we're ensuring your wallet balance is correct now!`)
      }
    },

    created() {
      this.spotPriceInterval = setInterval(() => this.$socket.emit('getSpotPrice', { type: 'XRP' }), 10000)

      this.$socket.emit('getSpotPrice', { type: 'XRP' })
      this.$socket.emit('walletGetUserWallets')
      this.$socket.emit('rippleGetAddress')
      this.$socket.emit('privacyGetActiveCard')
    },
    
    beforeDestroy() {
      clearInterval(this.spotPriceInterval)
    }
  }
</script>

<style scoped>
  code {
    display: block;
    border: 1px dashed;
  }
</style>