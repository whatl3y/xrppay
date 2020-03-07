<template lang="pug">
  div.table-responsive.m-0
    table.table.table-striped.table-bordered
      thead
        tr
          th #
          th Timestamp
          th Merchant
          th Amount (USD)
          th Result
      tbody
        tr(v-if="transactions.data.length === 0")
          td(colspan="100%")
            i No transactions yet...
        tr(v-else,v-for="(txn, ind) in transactions.data")
          td {{ getRowNumber(ind) }}
          td {{ getFormattedDate(txn.transaction_created_at) }}
          td {{ txn.merchant_descriptor }}
          td ${{ formatMoney(txn.amount_cents) }}
          td {{ txn.result }}
        tr(v-if="transactions.numberPages > 1")
          td(colspan="100%")
            div.d-flex.justify-content-end
              pagination(
                :info="transactions",
                @changePage="changePage",
                @changePerPage="changePerPage")
</template>

<script>
  import BigNumber from 'bignumber.js'
  import moment from 'moment'
  import ApiPrivacy from '../../factories/ApiPrivacy'

  export default {
    data() {
      return {
        transactions: {
          currentPage: 1,
          data: [],
          numberPages: 1,
          perPage: 5,
          totalCount: 0
        }
      }
    },

    methods: {
      getFormattedDate(dt) {
        return moment(dt).format('MMMM Do, YYYY h:mm a')
      },

      formatMoney(cents) {
        return new BigNumber(cents).dividedBy(100).toFixed(2)
      },

      getRowNumber(index) {
        return (this.transactions.perPage * (this.transactions.currentPage - 1)) + (index + 1)
      },

      async changePage(newPage) {
        this.transactions.currentPage = newPage
        await this.getTxns()
      },

      async changePerPage(newPerPage) {
        this.transactions.perPage = newPerPage
        await this.getTxns()
      },

      async getTxns() {
        try {
          const { transactions } = await ApiPrivacy.getTransactionHistory(
            this.transactions.currentPage,
            this.transactions.perPage)
          this.transactions = transactions
        } catch(err) {
          window.toastr.error(err.message)
        }
      }
    },

    async created() {
      await this.getTxns()
    }
  }
</script>
