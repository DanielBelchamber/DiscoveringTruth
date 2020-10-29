<template>
  <div class="argument-step">
    <div class="dependencies">{{ step.dependencies.join(',') }}</div>
    <div class="line">({{ step.line }})</div>
    <div class="formula"><FormulaSpan :formula="step.formula"></FormulaSpan></div>
    <div class="notation">{{ step.notation }}</div>
  </div>
</template>

<script>
import FormulaSpan from '@/components/FormulaSpan.vue'

export default {
  props: {
    step: Object
  },
  components: { FormulaSpan }
}
</script>

<style lang="scss" scoped>
.argument-step {
  display: flex;
  margin-bottom: 4px;

  .dependencies {
    width: 50px;
  }

  .line {
    width: 40px;
  }

  .formula {
    flex-grow: 1;
    min-width: 100px;
    text-align: start;
    padding-right: 16px;
  }

  .notation {
    width: 80px;
  }
}
</style>
