<template lang="pug">
  nav.navbar.navbar-expand-lg.navbar-light.bg-light
    router-link.navbar-brand(to='/') xrppay
    button.navbar-toggler(type='button', data-toggle='collapse', data-target='#navbarSupportedContent', aria-controls='navbarSupportedContent', aria-expanded='false', aria-label='Toggle navigation')
      span.navbar-toggler-icon
    div#navbarSupportedContent.collapse.navbar-collapse
      ul.navbar-nav.mr-auto
      //-   li.nav-item.active
      //-     router-link.nav-link(to='/')
      //-       | Home 
      //-       span.sr-only (current)
      //-   li.nav-item
      //-     a.nav-link(href='#') Link
      //-   li.nav-item.dropdown
      //-     a#navbarDropdown.nav-link.dropdown-toggle(href='#', role='button', data-toggle='dropdown', aria-haspopup='true', aria-expanded='false')
      //-       | Dropdown
      //-     div.dropdown-menu(aria-labelledby='navbarDropdown')
      //-       a.dropdown-item(href='#') Action
      //-       a.dropdown-item(href='#') Another action
      //-       .dropdown-divider
      //-       a.dropdown-item(href='#') Something else here
      //-   li.nav-item
      //-     a.nav-link.disabled(href='#') Disabled
      //- form.form-inline.my-2.my-lg-0
      //-   input.form-control.mr-sm-2(type='search', placeholder='Search', aria-label='Search')
      //-   button.btn.btn-outline-success.my-2.my-sm-0(type='submit') Search
      div.d-flex.align-items-center(v-if="isLoggedIn")
        div#top-nav-per-txn.mr-1.d-flex.align-items-center(v-if="perTxnFeePercent")
          div.small-nav {{ perTxnFeePercent }}% |
          b-tooltip(target="#top-nav-per-txn")
            | A fee of {{ perTxnFeePercent }}% per transaction will be charged to purchase something
            | when using a virtual card. This helps keep the lights on and this service online.
        div.mr-1.d-flex.align-items-center(v-if="maxTransaction")
          div#top-nav-max-txn.small-nav max ${{ maxTransaction }} |
          b-tooltip(target="#top-nav-max-txn")
            | A maximum of ${{ maxTransaction }} can be spent per transaction.
            | If you need to spend more please let us know.
        ul.navbar-nav
          li.nav-item
            a.nav-link(href='/logout') Logout

</template>

<script>
  import BigNumber from 'bignumber.js'
  import { mapState } from 'vuex'

  export default {
    computed: mapState({
      isLoggedIn: state => state.isLoggedIn,
      maxTransaction: state => new BigNumber(state.systemConfig.maxmimumPerTransaction || 0).toFixed(2),
      perTxnFeePercent: state => state.systemConfig.percentPerTransaction && new BigNumber(1).minus(state.systemConfig.percentPerTransaction).times(100).toString(),
    })
  }
</script>

<style lang="scss">
  .small-nav {
    color: #a0a0a0;
    font-size: 10px
  }
</style>