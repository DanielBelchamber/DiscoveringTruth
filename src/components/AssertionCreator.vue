<template>
  <!-- TODO: replace with form -->
  <section>
    <AssertionHeader :assertion="assertion"></AssertionHeader>
    <p class="assumption" v-for="(assumption, index) in assumptionStringList" :key="index">
      <label :for="getAssumptionID(index)">{{ getAssumptionLabel(index) }}</label>
      <input type="text" :id="getAssumptionID(index)" v-model="assumptionStringList[index]"/>
      <span class="remove" @click="removeAssumption(index)">&times;</span>
    </p>
    <p class="conclusion">
      <label for="conclusion">Conclusion:</label>
      <input type="text" id="conclusion" v-model="conclusionString"/>
    </p>

    <button @click="addAssumption" :disabled="atMaxAssumptions">Add Assumption</button>
    <button @click="declareAssertion" :disabled="!hasConclusion">Declare Assertion</button>
  </section>
</template>

<script>
import AssertionHeader from '@/components/AssertionHeader.vue'
import { parseFormulaString } from '@/models/formulaParser.js'

export default {
  components: {
    AssertionHeader
  },
  data () {
    return {
      assumptionLimit: 5, // hard-coded
      assumptionStringList: [],
      conclusionString: ''
    }
  },
  computed: {
    assertion () {
      try {
        const conclusion = parseFormulaString(this.conclusionString)
        const assumptionList = this.assumptionStringList.map(a => parseFormulaString(a))
        return { assumptionList, conclusion }
      } catch (error) {
        return {
          assumptionList: [],
          conclusion: null
        }
      }
    },
    atMaxAssumptions () {
      return this.assumptionStringList.length >= this.assumptionLimit
    },
    hasConclusion () {
      return this.assertion.conclusion !== null
    }
  },
  methods: {
    getAssumptionID (index) {
      return `assumption-${index}`
    },
    getAssumptionLabel (index) {
      return `Assumption ${index + 1}:`
    },
    addAssumption () {
      this.assumptionStringList.push('')
    },
    removeAssumption (index) {
      this.assumptionStringList.splice(index, 1)
    },
    declareAssertion () {
      this.$emit('declare', this.assertion)
    }
  }
}
</script>

<style lang="scss" scoped>
.assumption, .conclusion {
  label {
    cursor: text;
    padding-right: 8px;
  }

  .remove {
    cursor: pointer;
    padding: 0 4px;
  }
}

button {
  margin: 0 4px;

  &:disabled {
    cursor: not-allowed;
  }
}
</style>
