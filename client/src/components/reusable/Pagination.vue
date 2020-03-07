<template lang="pug">
  div.d-flex.justify-content-end(v-if="info.numberPages > 1")
    //- div.mr-4.d-flex.align-items-center
    //-   div.d-flex.align-items-center(v-if="size !== 'sm'")
    //-     label.mb-0.mr-2.text-right(v-if="perPageLabel",style="min-width:150px") {{ perPageLabel }}
    //-     select.form-control(v-model="mutablePerPage",@change="changePerPage()")
    //-       option(:value="page",v-for="page in $store.state.pageSizes") {{ page }}
    b-pagination.mb-0(:size="size",:limit="limit",v-model="info.currentPage",:total-rows="info.totalCount",:per-page="info.perPage",@change="changePage")
</template>

<script>
  export default {
    props: {
      perPageLabel: { type: String, default: 'Per page:' },
      info: { type: Object },
      size: { type: String, default: null }
    },

    data() {
      return {
        mutablePerPage: 30
      }
    },

    computed: {
      limit() {
        return (this.size === 'sm') ? 3 : 5
      }
    },

    methods: {
      changePage(...args) {
        this.$emit('changePage', ...args)
      },

      changePerPage() {
        this.$emit('changePerPage', this.mutablePerPage)
      }
    },

    created() {
      this.mutablePerPage = this.info.perPage || this.mutablePerPage
    }
  }
</script>
