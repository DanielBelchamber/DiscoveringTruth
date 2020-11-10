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
  td {
    padding: 4px 8px;
    text-align: center;
  }

  .formula {
    min-width: 100px;
    text-align: left;
  }
}
</style>
