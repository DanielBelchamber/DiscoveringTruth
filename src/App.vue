<template>
  <div id="app">
    <header>
      <h1>Propositional Logic</h1>
    </header>
    <main>
      <ArgumentBuilder :assertion="assertion" @submit="validateArgument"></ArgumentBuilder>
      <p v-if="hasProof" class="congratulations">Your proof is valid!</p>
    </main>
  </div>
</template>

<script>
import EXAMPLE_DATA from '@/EXAMPLE_DATA.js'
import ArgumentBuilder from '@/components/ArgumentBuilder.vue'
import { validateProof } from '@/models/proofValidator.js'

export default {
  components: {
    ArgumentBuilder
  },
  data () {
    return {
      assertion: EXAMPLE_DATA.assertion,
      hasProof: false
    }
  },
  methods: {
    validateArgument (argument) {
      this.hasProof = validateProof(this.assertion, argument)
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
