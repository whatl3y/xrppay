<template lang="pug">
  div.row
    div.col-lg-8.offset-lg-2.my-4
      div.card.border-0
        div.card-body
          div.row.small-gutters
            div.col-lg-6.mb-2
              div
                | Wallet Balance:
                | #[i#refresh-wallet.clickable.fa.fa-sync-alt(@click="refreshWallet")]
                | #[i#send-ripple-button.ml-1.clickable.fa.fa-share(v-show="userXrpWalletCurrentAmount > 1",data-toggle="modal",data-target="#send-xrp-modal")]
              div.text-large {{ userXrpWalletCurrentAmount }} XRP ≈ ${{ currentAmountUsd }} USD

              b-tooltip(target="refresh-wallet",placement="rightbottom")
                | Is your wallet missing a credit or debit you expect to see? We have background workers
                | running constantly to ensure the integrity and accuracy of all balances,
                | but you can force an off-schedule automated review of your wallet balance by
                | clicking here.

              b-tooltip(target="send-ripple-button",placement="rightbottom")
                | Send currency from this wallet to another external wallet.
            div.col-lg-6.text-right.small
              div #[i#exchange-rate-info.fa.fa-info-circle] Exchange Rate
              div 1 XRP ≈ ${{ xrpExchangePrice || 'N/A' }} USD
              div.small Updated {{ exchangeUpdated }}

              b-tooltip(target="exchange-rate-info",placement="left")
                | We use Coinbase's spot price as the exchange rate between fiat and cryptocurrencies.
                | This price usually sits somewhere between the buy and sell price at any point in time.
      div.card.mt-4
        div.card-header
          h4.m-0 1. Fund Your Account
        div.card-body
          div.mb-4.small
            div Send Ripple (XRP) to this address &amp; tag combo.
            div.mt-2
              strong
                | Make sure you include the tag when sending XRP to this address.
                | If you send XRP without specifying the tag we cannot fund your account.


          div
            div.text-center
              div.row
                div.col-lg-8.offset-lg-2
                  div.form-group
                    label XRP Address
                    div
                      code.p-1 {{ xrpAddress.mod2 }}
                  div.form-group
                    label#fund-account-tag-info
                      | XRP Tag#[sup.text-danger *] #[i.fa.fa-info-circle]
                    b-tooltip(target="#fund-account-tag-info",placement="right")
                      | Make sure you include the tag when sending XRP to this address.
                      | If you send XRP without specifying the tag here we cannot fund your account.
                    div
                      code.p-1 {{ xrpAddress.mod1 }}
        
        div.card-header.border-top
          h4.m-0 2. Use Card Info at Merchant
        div.card-body
          privacy-card-info

    send-xrp-modal#send-xrp-modal(v-if="userXrpWalletCurrentAmount > 1")
</template>

<script>
  import BigNumber from 'bignumber.js'
  import moment from 'moment'
  import { mapState } from 'vuex'
  import PrivacyCardInfo from './PrivacyCardInfo'

  export default {
    data() {
      return {
        spotPriceInterval: null,
      }
    },

    computed: {
      ...mapState({
        xrpAddress: state => state.ripple.address,
        xrpExchangePrice: state => state.exchangePrices.xrp,
        exchangeUpdated: state => moment(state.exchangePricesLastUpdated).format('h:mm:ss a'),
        userXrpWallet: state => state.wallets.xrp || {},

        currentAmountUsd(state) {
          return new BigNumber(state.calculateAmountUsd('xrp', this.userXrpWallet.current_amount || 0)).toFixed(2)
        }
      }),

      userXrpWalletCurrentAmount() {
        return new BigNumber(this.userXrpWallet.current_amount || 0).toFixed(2)
      }
    },

    methods: {
      refreshWallet() {
        this.$socket.emit('refreshUserWallet', 'xrp')
        window.toastr.success(`Sit tight, we're ensuring your wallet balance is correct!`)
      },

      async init() {
        this.$socket.emit('getSpotPrice', { type: 'XRP' })
        this.$socket.emit('privacyGetActiveCard')
        this.$socket.emit('rippleGetAddress')
        this.$socket.emit('walletGetUserWallets')
        this.$socket.emit('getSystemConfig')

        this.spotPriceInterval = this.spotPriceInterval || setInterval(() => this.$socket.emit('getSpotPrice', { type: 'XRP' }), 10000)
      }
    },

    async created() {
      this.$socket.on('refresh', async () => await this.init)
      await this.init()
    },
    
    beforeDestroy() {
      clearInterval(this.spotPriceInterval)
    },

    components: {
      PrivacyCardInfo
    }
  }
</script>

<style scoped>
  code {
    display: block;
    border: 1px dashed;
  }
</style>