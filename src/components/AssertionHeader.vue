<template>
  <h2 class="assertion-header">
    <template v-for="(assumption, index) in assertion.assumptionList">
      <FormulaSpan :key="index" class="assumption" :formula="assumption"></FormulaSpan>
      <span v-if="!isLastAssumption(index)" :key="index + ','" class="comma">,&nbsp;</span>
    </template>
    <span class="assert" v-html="assertHtml"></span>
    <FormulaSpan class="conclusion" :formula="assertion.conclusion"></FormulaSpan>
  </h2>
</template>

<script>
import FormulaSpan from '@/components/FormulaSpan.vue'

export default {
  components: {
    FormulaSpan
  },
  props: {
    assertion: Object
  },
  computed: {
    assertHtml () {
      const space = '&nbsp;'
      const assert = '\u22A6'
      let spacingBefore = ''
      if (this.assertion.assumptionList.length > 0) {
        spacingBefore += `${space}${space}`
      }
      return spacingBefore + `${assert}${space}${space}`
    }
  },
  methods: {
    isLastAssumption (index) {
      return index === this.assertion.assumptionList.length - 1
    }
  }
}
</script>

<style lang="scss" scoped>
.assertion-header {
  display: inline-block;
  padding: 2px 8px;
  border-bottom: 2px solid black;
}
</style>
