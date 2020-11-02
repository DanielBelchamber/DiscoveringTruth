<template>
  <h1 class="assertion-header">
    <template v-if="!hasConclusion">
      <span class="placeholder">Declare Assertion</span>
    </template>
    <template v-else>
      <template v-for="(assumption, index) in assertion.assumptionList">
        <FormulaSpan :key="index" class="assumption" :formula="assumption"></FormulaSpan>
        <span v-if="!isLastAssumption(index)" :key="index + ','" class="comma">,&nbsp;</span>
      </template>
      <span class="assert" v-html="assertHtml"></span>
      <FormulaSpan class="conclusion" :formula="assertion.conclusion"></FormulaSpan>
    </template>
  </h1>
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
    hasConclusion () {
      return this.assertion.conclusion !== null
    },
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
  padding: 2px 8px;
  border-bottom: 2px solid black;

  .placeholder {
    color: #a6a6a6;
  }
}
</style>
