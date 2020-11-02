<template>
  <p class="argument-step">
    <span class="dependencies">{{ step.dependencies.join(',') }}</span>
    <span class="line">({{ step.line }})</span>
    <span class="formula"><FormulaSpan :formula="step.formula"></FormulaSpan></span>
    <span class="notation">{{ step.notation }}</span>
  </p>
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
  margin: 4px 0;

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
