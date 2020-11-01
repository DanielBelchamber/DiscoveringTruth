<template>
  <form @submit.prevent="commit">
    <p class="formula">
      <label for="assumption">Formula:</label>
      <input type="text" id="assumption" v-model="formulaString"/>
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

    <input type="submit" :disabled="!isWellFormed" value="Commit Step"/>
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
      formulaString: '',
      referenceList: this.getReferenceList(this.rule.type)
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
    isWellFormed () {
      return this.formula !== null
    }
  },
  methods: {
    getReferenceList (ruleType) {
      switch (ruleType) {
        case 'MPP':
          return [
            { id: 'implication', label: 'Implication Step:', value: null },
            { id: 'antecedent', label: 'Antecedent Step:', value: null }
          ]
        case 'A':
        default:
          return []
      }
    },
    commit () {
      const stepNumber = this.argument.length + 1
      const step = {
        line: stepNumber,
        formula: this.formula
      }
      let references
      const rule = this.rule
      const argument = this.argument
      switch (rule.type) {
        case 'A':
          step.dependencies = [stepNumber]
          step.notation = rule.getNotation()
          break
        case 'MPP':
        default:
          references = this.referenceList.map(r => r.value)
          step.dependencies = references
            .map(reference => {
              const step = argument[reference - 1]
              return [...step.dependencies]
            })
            .reduce((refList, depList) => {
              depList.forEach(d => {
                if (refList.indexOf(d) === -1) refList.push(d)
              })
              return refList
            })
            .sort()
          step.notation = rule.getNotation(...references)
          break
      }
      this.$emit('commit', step)
    }
  },
  watch: {
    'rule.type': {
      handler (newType) {
        this.referenceList = this.getReferenceList(newType)
      }
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
    width: 150px;
    padding-right: 8px;
  }

  input[type=number] {
    width: 40px;
  }
}
</style>
