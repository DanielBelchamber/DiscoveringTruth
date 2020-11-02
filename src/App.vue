<template>
  <div id="app">
    <main>
      <template v-if="!assertionDelcared">
        <AssertionCreator @declare="declareAssertion"></AssertionCreator>
      </template>
      <template v-else>
        <ArgumentBuilder :assertion="assertion" @validate="validateArgument"></ArgumentBuilder>
      </template>

      <template v-if="argumentGiven">
        <p v-if="proofValidated" class="congratulations">Your proof is valid!</p>
        <p v-else class="invalid">Your proof is invalid.</p>
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
      argumentGiven: false,
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
      this.argumentGiven = true
      try {
        this.proofValidated = validateProof(this.assertion, argument)
      } catch (error) {
        this.proofValidated = false
      }
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
    min-width: 320px;
    flex-grow: 1;
    text-align: center;
  }

  .congratulations, .invalid {
    font-size: 20px;
  }

  .congratulations {
    color: #4baf4f;
  }

  .invalid {
    color: #ff5252;
  }
}

button {
  cursor: pointer;
}
</style>
