<template>
  <div class="assertion-header">
    <template v-for="(assumption, index) in assertion.assumptionList">
      <FormulaSpan :key="index" class="assumption" :formula="assumption"></FormulaSpan>
      <span v-if="!isLastAssumption(index)" :key="index + ','" class="comma">,&nbsp;</span>
    </template>
    <span class="assert" v-html="assertHtml"></span>
    <FormulaSpan class="conclusion" :formula="assertion.conclusion"></FormulaSpan>
  </div>
</template>

<script>
import FormulaSpan from '@/components/FormulaSpan.vue'

export default {
  props: {
    assertion: Object
  },
  components: { FormulaSpan },
  computed: {
    assertHtml () {
      const space = '&nbsp;'
      const assert = '&#x22A6;'
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
  margin-bottom: 8px;

  span {
    cursor: default;
    font-size: 20px;
  }

  .assumption, .conclusion {
    cursor: pointer;
    padding: 0 2px;
    &:hover, &:focus {
      background-color: lightblue;
    }
  }
}
</style>
