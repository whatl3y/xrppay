<template lang="pug">
  div.ccard.p-4
    div.d-flex.align-items-start
      h3.mb-3 xrppay
      div.small.ml-auto CVV: #[span.num {{ cvv }}]
    div.mb-3.text-large.text-center.num {{ pan }}
    div.row.no-gutters
      div.col-7.text-right
        div.d-flex.align-items-center.justify-content-end
          div.mr-1(style="font-size: 6px")
            div valid
            div thru
          div.num(style="font-size: 13px;") {{ expMonth }}/{{ expYear }}
        div {{ user.name ? user.name : user.username_email }}
      div.col-4.offset-1.d-flex.align-items-center.justify-content-end
        div
          - // TODO: Dynamically load image based on `type`
          img.img-fluid(src="/public/images/visa.png")
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    props: {
      type: { type: String, default: 'visa' }, 
      pan: { type: String, default: null },
      cvv: { type: String, default: null },
      expMonth: { type: String, default: null },
      expYear: { type: String, default: null }
    },

    computed: mapState({
      user: state => state.session.user
    })
  }
</script>

<style lang="scss">
  .ccard {
    border: 5px solid;
    border-radius: 25px;
    display: inline-block;
    max-width: 380px;

    .num {
      font-family: "Courier New", Courier, monospace;
    }
  }
</style>