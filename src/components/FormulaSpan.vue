<template>
  <span class="formula-span" v-html="formulaHtml"></span>
</template>

<script>
import { mapToHtml } from '@/models/symbolMapper.js'

export default {
  props: {
    formula: Object
  },
  computed: {
    formulaHtml () {
      const formulaString = this.formula.toString()
      return mapToHtml(formulaString)
    }
  }
}
</script>
