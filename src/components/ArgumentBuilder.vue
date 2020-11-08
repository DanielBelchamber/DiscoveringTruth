<template>
  <section class="argument-builder">
    <AssertionHeader :assertion="assertion"></AssertionHeader>
    <table class="argument">
      <ArgumentStep v-for="(step, stepIndex) in argument" :key="stepIndex" :step="step"></ArgumentStep>
    </table>

    <template v-if="!hasSubmitted && addingStep">
      <select class="rule" v-model="rule">
        <option disabled :value="null">Choose Derivation Rule</option>
        <option
          v-for="(rule, index) in ruleList"
          :key="index"
          :value="rule"
          :disabled="!isAssumptionOrNotFirst(rule.type)"
        >
          {{ rule.name }}
        </option>
      </select>
      <button @click="cancel">Cancel</button>
      <template v-if="rule">
        <StepMaker :argument="argument" :rule="rule" @commit="commitStep"></StepMaker>
      </template>
    </template>

    <template v-if="!hasSubmitted && !addingStep">
      <button @click="addStep">Add Step</button>
      <button @click="submitArgument">Submit Argument</button>
    </template>
  </section>
</template>

<script>
import AssertionHeader from '@/components/AssertionHeader.vue'
import ArgumentStep from '@/components/ArgumentStep.vue'
import StepMaker from '@/components/StepMaker.vue'
import { DERIVATION_RULES } from '@/models/proofValidator.js'

export default {
  components: {
    AssertionHeader,
    ArgumentStep,
    StepMaker
  },
  props: {
    assertion: Object
  },
  data () {
    return {
      argument: [],
      ruleList: DERIVATION_RULES,
      rule: null,
      addingStep: false,
      hasSubmitted: false
    }
  },
  methods: {
    addStep () {
      this.addingStep = true
    },
    isAssumptionOrNotFirst (ruleType) {
      return ruleType === 'A' || this.argument.length > 0
    },
    cancel () {
      this.addingStep = false
      this.rule = null
    },
    commitStep (step) {
      this.argument.push(step)
      this.addingStep = false
      this.rule = null
    },
    submitArgument () {
      this.$emit('validate', this.argument)
      this.hasSubmitted = true
    }
  }
}
</script>

<style lang="scss" scoped>
.argument-builder button {
  margin: 16px 4px 0;
}

.argument {
  display: block;
}

select.rule {
  margin-top: 16px;
}
</style>
