<template lang="pug">
  i.fal.fa-spinner.fa-spin(:class="getSizeClass()")
</template>

<script>
  export default {
    props: {
      size: { type: [ Number, String ], default: null }
    },

    methods: {
      getSizeClass() {
        return (this.size) ? `fa-${this.size}x` : ''
      }
    }
  }
</script>
