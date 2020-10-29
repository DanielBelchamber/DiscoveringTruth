<template>
  <div class="argument-builder">
    <div class="argument-container">
      <ArgumentStep v-for="(step, stepIndex) in argument" :key="stepIndex" :step="step"></ArgumentStep>
    </div>
    <button v-if="!hasSubmitted" @click="submitArgument">Submit Argument</button>
  </div>
</template>

<script>
import EXAMPLE_DATA from '@/EXAMPLE_DATA.js'
import ArgumentStep from '@/components/ArgumentStep.vue'

export default {
  components: { ArgumentStep },
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
