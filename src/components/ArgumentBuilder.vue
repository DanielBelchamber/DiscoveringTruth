<template>
  <section class="argument-builder">
    <AssertionHeader :assertion="assertion"></AssertionHeader>
    <article class="argument">
      <ArgumentStep v-for="(step, stepIndex) in argument" :key="stepIndex" :step="step"></ArgumentStep>
    </article>
    <button v-if="!hasSubmitted" @click="submitArgument">Submit Argument</button>
  </section>
</template>

<script>
import EXAMPLE_DATA from '@/EXAMPLE_DATA.js'
import AssertionHeader from '@/components/AssertionHeader.vue'
import ArgumentStep from '@/components/ArgumentStep.vue'

export default {
  components: {
    AssertionHeader,
    ArgumentStep
  },
  props: {
    assertion: Object
  },
  data () {
    return {
      argument: EXAMPLE_DATA.argument,
      hasSubmitted: false
    }
  },
  methods: {
    submitArgument () {
      this.$emit('submit', this.argument)
      this.hasSubmitted = true
    }
  }
}
</script>

<style lang="scss" scoped>
.argument-builder button {
  margin-top: 16px;
}
</style>
