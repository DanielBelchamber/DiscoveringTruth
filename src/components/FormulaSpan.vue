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
      if (this.formula === null) return ''
      const formulaString = this.formula.string
      return mapToHtml(formulaString)
    }
  }
}
</script>
