<template>
  <tr class="argument-step">
    <td class="dependencies">{{ step.dependencies.join(',') }}</td>
    <td class="line">({{ step.line }})</td>
    <td class="formula"><FormulaSpan :formula="step.formula"></FormulaSpan></td>
    <td class="notation">{{ step.notation }}</td>
  </tr>
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
    text-align: left;
    padding-right: 16px;
  }

  .notation {
    width: 80px;
  }
}
</style>
