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
          div(v-if="!privacyCard")
            div.alert.alert-warning.mb-0
              | No active card available to use at a merchant. Once you fund your
              | account we will automatically create a card for you to use at
              | your merchant of choice.
          div.row.small-gutters(v-else)
            div.col-12.mb-4.text-center.small
              | Use your virtual card anywhere online that accepts Visa prepaid debit cards.
              | After you #[button.btn.btn-vsm.btn-primary(@click="lockCard") Lock] your
              | card below your card will be temporarily loaded with funds up to the
              | amount available in your wallet (max of ${{ maxTransaction }} per transaction).
            div.col-12
              div.form-group
                - //label Card Name
                div
                  strong {{ privacyCard.friendly_name }}
            div.col-lg-6
              div.form-group
                credit-card(
                  type="visa",
                  :pan="cardNumber",
                  :cvv="privacyCard.cvv",
                  :exp-month="privacyCard.exp_month",
                  :exp-year="privacyCard.exp_year")
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
                        label.nowrap Spend Limit #[i#spend-limit-info.fa.fa-info-circle]
                        b-tooltip(target="#spend-limit-info")
                          | Your spend limit will be up to the amount of currency in your wallet
                          | (up to a max of ${{ maxTransaction }}) minus {{ percentTake }}% that
                          | is taken as a fee on any transaction you make. This pays our bills
                          | so we can keep this service up and running.
                        div
                          strong ${{ privacyCardLimitUsd }}
                    div.col.d-flex.align-items-center.justify-content-end
                      div
                        button#lock-privacy-card.btn.btn-primary(@click="lockCard") Lock #[i.fa.fa-info-circle]
                        b-tooltip(target="lock-privacy-card",placement="right")
                          | Locking your card temporarily adds funds to your card you can spend at
                          | your merchant of choice (up to a maximum of ${{ maxTransaction }} per transaction).
                          | We calculate the exchange rate of your cryptocurrency wallet at the time you lock the card
                          | to add funds to it, and the card is active for up to 10 minutes. After 10
                          | minutes if you don't use your card, it will be paused again and you'll have to 
                          | re-lock at the latest exchange rate.
              div.mt-2.text-danger.text-center(v-if="privacyCard.state === 'OPEN' && changingCardActiveDuration")
                div.mb-2.small
                  | Your card is loaded and ready to use. After the following
                  | time it will be PAUSED and require relocking at the latest
                  | exchange rate.
                div
                  | #[strong {{ changingCardActiveDuration.minutes() }}] min,
                  | #[strong {{ changingCardActiveDuration.seconds() }}] sec remaining

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
        maxTransaction: state => new BigNumber(state.systemConfig.maxmimumPerTransaction || 0).toFixed(2),
        percentTake: state => new BigNumber(1).minus(state.systemConfig.percentPerTransaction).times(100).toString(),
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
    }
  }
</script>

<style scoped>
  code {
    display: block;
    border: 1px dashed;
  }
</style>