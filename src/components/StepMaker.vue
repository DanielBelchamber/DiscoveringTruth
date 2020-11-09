<template>
  <form @submit.prevent="commit">
    <p class="formula">
      <label for="formula">Formula:</label>
      <input type="text" id="formula" v-model="formulaString"/>
    </p>

    <p v-for="(reference, index) in referenceList" class="reference" :key="index">
      <label :for="reference.id">{{ reference.label }}</label>
      <input
        type="number"
        :id="reference.id"
        min="1"
        :max="argument.length"
        v-model="referenceList[index].value"
      />
    </p>

    <input type="submit" :disabled="formula === null" value="Commit Step"/>
  </form>
</template>

<script>
import { parseFormulaString } from '@/models/formulaParser.js'

export default {
  props: {
    argument: Array,
    rule: Object
  },
  data () {
    return {
      formulaString: ''
    }
  },
  computed: {
    formula () {
      try {
        return parseFormulaString(this.formulaString)
      } catch (error) {
        return null
      }
    },
    referenceList () {
      const ruleType = this.rule.type
      switch (ruleType) {
        case 'A':
        default:
          return []
        case 'DNI':
        case 'DNE':
        case 'CE':
        case 'DI':
          return [
            { id: 'reference', label: 'Reference Step:', value: null }
          ]
        case 'MPP':
          return [
            { id: 'implication', label: 'Implication Step:', value: null },
            { id: 'antecedent', label: 'Antecedent Step:', value: null }
          ]
        case 'MTT':
          return [
            { id: 'implication', label: 'Implication Step:', value: null },
            { id: 'notConsequent', label: 'Consequent Negation Step:', value: null }
          ]
        case 'CP':
          return [
            { id: 'antecedent', label: 'Antecedent Assumption Step:', value: null },
            { id: 'consequent', label: 'Consequent Step:', value: null }
          ]
        case 'CI':
          return [
            { id: 'left', label: 'Left Step:', value: null },
            { id: 'right', label: 'Right Step:', value: null }
          ]
        case 'DE':
          return [
            { id: 'disjunction', label: 'Disjunction Step:', value: null },
            { id: 'leftAssumption', label: 'Left Assumption Step:', value: null },
            { id: 'leftConclusion', label: 'Left Conclusion Step:', value: null },
            { id: 'rightAssumption', label: 'Right Assumption Step:', value: null },
            { id: 'rightConclusion', label: 'Right Conclusion Step:', value: null }
          ]
      }
    }
  },
  methods: {
    commit () {
      const stepNumber = this.argument.length + 1
      const step = {
        line: stepNumber,
        formula: this.formula
      }
      const rule = this.rule
      const argument = this.argument
      // set dependencies and notation according to rule type
      if (rule.type === 'A') {
        step.dependencies = [stepNumber]
        step.notation = rule.getNotation()
      } else if (rule.type === 'CP') {
        const referenceNumbers = this.referenceList.map(r => r.value)
        step.notation = rule.getNotation(...referenceNumbers)
        const antecedent = argument[referenceNumbers[0] - 1]
        const consequent = argument[referenceNumbers[1] - 1]
        step.dependencies = [...consequent.dependencies]
        const depIndex = step.dependencies.indexOf(antecedent.line)
        step.dependencies.splice(depIndex, 1)
      } else if (rule.type === 'DE') {
        const referenceNumbers = this.referenceList.map(r => r.value)
        step.notation = rule.getNotation(...referenceNumbers)
        const disjunction = argument[referenceNumbers[0] - 1]
        const leftA = argument[referenceNumbers[1] - 1]
        const leftC = argument[referenceNumbers[2] - 1]
        const leftDeps = [...leftC.dependencies]
        leftDeps.splice(leftC.dependencies.indexOf(leftA.line), 1)
        const rightA = argument[referenceNumbers[3] - 1]
        const rightC = argument[referenceNumbers[4] - 1]
        const rightDeps = [...rightC.dependencies]
        rightDeps.splice(rightC.dependencies.indexOf(rightA.line), 1)
        step.dependencies = [
          ...new Set([disjunction.dependencies, leftDeps, rightDeps].flat())
        ].sort()
      } else { // DNI, DNE, MPP, MTT, CI, CE, DI
        const referenceNumbers = this.referenceList.map(r => r.value)
        step.notation = rule.getNotation(...referenceNumbers)
        step.dependencies = [
          ...new Set(
            referenceNumbers
              .map(r => [...argument[r - 1].dependencies])
              .flat()
          )
        ].sort()
      }
      this.$emit('commit', step)
    }
  }
}
</script>

<style lang="scss" scoped>
.formula label {
  display: inline-block;
  padding-right: 8px;
}

.reference {
  label {
    display: inline-block;
    padding-right: 8px;
  }

  input[type=number] {
    width: 40px;
  }
}
</style>
