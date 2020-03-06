<template lang="pug">
  div.row
    div.col-lg-8.offset-lg-2.my-4
      div.card.border-0
        div.card-body
          div.d-flex.align-items-start
            div
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
                | If you want to send any amount in your wallet to another address,
                | click here to designate the destination and amount to send.
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
        
        div.card-header.border-top
          h4.m-0 2. Use Card Info at Merchant
        div.card-body
          div(v-if="!privacyCard")
            div.alert.alert-warning.mb-0
              | No active card available to use at a merchant. Once you fund your
              | account we will automatically create a card for you to use at
              | your merchant of choice.
          div.row.small-gutters(v-else)
            div.col-lg-6
              div.form-group
                - //label Card Name
                div
                  strong {{ privacyCard.friendly_name }}
              div.form-group
                label Card #
                div.text-large
                  strong {{ cardNumber }}
            div.col-lg-6
              div.card
                div.card-body.py-2
                  div.row.small-gutters
                    div.col
                      div.form-group.m-0
                        label State
                        div
                          strong {{ privacyCard.state }}
                    div.col
                      div.form-group.m-0
                        label Spend Limit
                        div
                          strong ${{ privacyCardLimitUsd }}
                    div.col.d-flex.align-items-center.justify-content-end
                      div(v-if="privacyCard.state !== 'OPEN'")
                        button#lock-privacy-card.btn.btn-vsm.btn-primary(@click="lockCard") Lock #[i.fa.fa-info-circle]
                        b-tooltip(target="lock-privacy-card",placement="right")
                          | Locking your card temporarily adds funds to your card you can spend at
                          | your merchant of choice (up to a maximum of ${{ maxTransaction }}). We calculate the
                          | exchange rate of your cryptocurrency wallet at the time you lock the card
                          | to add funds to it, and the card is active for up to 10 minutes. After 10
                          | minutes if you don't use your card, it will be paused again and you'll have to 
                          | re-lock at the latest exchange rate.
                      div.small.text-danger(v-else-if="changingCardActiveDuration")
                        | #[strong {{ changingCardActiveDuration.minutes() }}] min,
                        | #[strong {{ changingCardActiveDuration.seconds() }}] sec remaining
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

    send-xrp-modal#send-xrp-modal(v-if="userXrpWalletCurrentAmount > 1")
</template>

<script>
  import BigNumber from 'bignumber.js'
  import { mapState } from 'vuex'
  import moment from 'moment'
  import ApiPrivacy from '../../factories/ApiPrivacy'

  export default {
    data() {
      return {
        spotPriceInterval: null,
        
        privacyActiveSecondsRemaining: null,
        changingCardActiveDuration: null,
        changingCardActiveInterval: null
      }
    },

    computed: {
      ...mapState({
        privacyCard: state => state.privacy.card,
        xrpAddress: state => state.ripple.address,
        xrpExchangePrice: state => state.exchangePrices.xrp,
        exchangeUpdated: state => moment(state.exchangePricesLastUpdated).format('h:mm:ss a'),
        userXrpWallet: state => state.wallets.xrp || {},
        maxTransaction: state => state.privacy.maxPerTransaction,
        privacyCardLimitUsd: (_, getters) => getters.getPrivacyCardLimitUsd,

        currentAmountUsd(state) {
          return new BigNumber(state.calculateAmountUsd('xrp', this.userXrpWallet.current_amount || 0)).toFixed(2)
        },

        privacyActiveExpSeconds(state) {
          return state.privacy.activeExpirationSeconds
        }
      }),

      userXrpWalletCurrentAmount() {
        return new BigNumber(this.userXrpWallet.current_amount || 0).toFixed(2)
      },

      cardNumber() {
        return ((this.privacyCard.card_number || '').match(/\d{4}/g) || []).join(' ')
      }
    },

    watch: {
      privacyActiveExpSeconds(newSeconds) {
        if (!newSeconds || newSeconds <= 0)
          return

        this.changingCardActiveInterval = this.changingCardActiveInterval || setInterval(() => {
          this.privacyActiveSecondsRemaining = (this.privacyActiveSecondsRemaining) ? this.privacyActiveSecondsRemaining - 1 : newSeconds
          const remainderCardActiveSeconds = moment.duration(this.privacyActiveSecondsRemaining, 'seconds')
          if (!this.privacyActiveSecondsRemaining || this.privacyActiveSecondsRemaining <= 0) {
            this.changingCardActiveDuration = null
            clearInterval(this.changingCardActiveInterval)
            return this.changingCardActiveInterval = null
          }

          this.changingCardActiveDuration = remainderCardActiveSeconds
        }, 1000)
      }
    },

    methods: {
      async lockCard() {
        try {
          await ApiPrivacy.lockBurnerCard()
          window.toastr.success(`Successfully updated your card! Your spend limit is updated, please use your card within 10 minutes or you will have to relock it later.`)
        } catch(err) {
          window.toastr.error(err.message)
        }
      },

      refreshWallet() {
        this.$socket.emit('refreshUserWallet', 'xrp')
        window.toastr.success(`Sit tight, we're ensuring your wallet balance is correct!`)
      },

      async init() {
        this.$socket.emit('getSpotPrice', { type: 'XRP' })
        this.$socket.emit('privacyGetActiveCard')
        this.$socket.emit('rippleGetAddress')
        this.$socket.emit('walletGetUserWallets')
        this.$socket.emit('getMaximumSpendPerTransaction')

        this.spotPriceInterval = this.spotPriceInterval || setInterval(() => this.$socket.emit('getSpotPrice', { type: 'XRP' }), 10000)
      }
    },

    async created() {
      this.$socket.on('refresh', async () => await this.init)
      await this.init()
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