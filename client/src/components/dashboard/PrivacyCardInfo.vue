<template lang="pug">
  div
    ul.nav.nav-tabs.mb-4
      li.nav-item
        a.nav-link(:class="activeTab === 'activeCard' && 'active'",@click="activeTab = 'activeCard'") Active Card
      li.nav-item
        a.nav-link(:class="activeTab === 'txnHistory' && 'active'",@click="activeTab = 'txnHistory'") Transaction History
    div(v-if="activeTab === 'activeCard'")
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
                div.col-lg-4.mb-3
                  div.form-group.m-0
                    label Type
                    div
                      strong {{ privacyCard.type.replace(/_/g, ' ') }}
                div.col-lg-4.mb-3
                  div.form-group.m-0
                    label State
                    div
                      strong {{ privacyCard.state }}
                div.col-lg-4.mb-3
                  div.form-group.m-0
                    label.nowrap Spend Limit #[i#spend-limit-info.fa.fa-info-circle]
                    b-tooltip(target="#spend-limit-info")
                      | Your spend limit will be up to the amount of currency in your wallet
                      | (up to a max of ${{ maxTransaction }}) minus {{ percentTake }}% that
                      | is taken as a fee on any transaction you make. This pays our bills
                      | so we can keep this service up and running.
                    div
                      strong ${{ privacyCardLimitUsd }}
                div.col-12.d-flex.justify-content-center
                  div
                    button#lock-privacy-card.btn.btn-lg.btn-primary(@click="lockCard") Lock #[i.fa.fa-info-circle]
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

    div(v-if="activeTab === 'txnHistory'")
      privacy-transaction-history
</template>

<script>
  import BigNumber from 'bignumber.js'
  import moment from 'moment'
  import { mapState } from 'vuex'
  import PrivacyTransactionHistory from './PrivacyTransactionHistory'
  import ApiPrivacy from '../../factories/ApiPrivacy'

  export default {
    data() {
      return {
        activeTab: 'activeCard',

        changingCardActiveDuration: null,
        changingCardActiveInterval: null,
        privacyActiveSecondsRemaining: null
      }
    },

    computed: {
      ...mapState({
        maxTransaction: state => new BigNumber(state.systemConfig.maxmimumPerTransaction || 0).toFixed(2),
        percentTake: state => new BigNumber(1).minus(state.systemConfig.percentPerTransaction).times(100).toString(),
        privacyCard: state => state.privacy.card,
        privacyCardLimitUsd: (_, getters) => getters.getPrivacyCardLimitUsd,

        privacyActiveExpSeconds(state) {
          return state.privacy.activeExpirationSeconds
        }
      }),

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
      }
    },

    components: {
      PrivacyTransactionHistory
    }
  }
</script>
