<template>
  <div id="app">
    <header>
      <h1>Propositional Logic</h1>
    </header>
    <main>
      <template v-if="!assertionDelcared">
        <AssertionCreator @declare="declareAssertion"></AssertionCreator>
      </template>
      <template v-else>
        <ArgumentBuilder :assertion="assertion" @validate="validateArgument"></ArgumentBuilder>
      </template>

      <template v-if="proofValidated">
        <p class="congratulations">Your proof is valid!</p>
      </template>
    </main>
  </div>
</template>

<script>
import ArgumentBuilder from '@/components/ArgumentBuilder.vue'
import AssertionCreator from '@/components/AssertionCreator.vue'
import { validateProof } from '@/models/proofValidator.js'

export default {
  components: {
    AssertionCreator,
    ArgumentBuilder
  },
  data () {
    return {
      assertion: null,
      proofValidated: false
    }
  },
  computed: {
    assertionDelcared () {
      return this.assertion !== null
    }
  },
  methods: {
    declareAssertion (assertion) {
      this.assertion = assertion
    },
    validateArgument (argument) {
      this.proofValidated = validateProof(this.assertion, argument)
    }
  }
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

body {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: white;
  color: black;
  height: inherit;
  width: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  main {
    flex-grow: 1;
    text-align: center;
  }

  .congratulations {
    font-size: 20px;
  }

  button {
    cursor: pointer;
  }
}
</style>
