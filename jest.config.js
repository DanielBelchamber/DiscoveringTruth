module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/App.vue',
    'src/components/**/*.vue',
    'src/models/**/*.js'
  ]
}
