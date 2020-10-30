<template>
  <section>
    <AssertionHeader :assertion="assertion"></AssertionHeader>
  </section>
</template>

<script>
import AssertionHeader from '@/components/AssertionHeader.vue'

export default {
  components: {
    AssertionHeader
  },
  data () {
    return {
      assertion: {
        assumptionList: [],
        conclusion: null
      }
    }
  }
}
</script>
