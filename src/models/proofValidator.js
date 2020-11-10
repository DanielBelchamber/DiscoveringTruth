import { DERIVATION_RULES } from '@/models/derivationRules.js'

const isConclusionAssertive = (assertion, argument) => {
  const conclusionStep = argument[argument.length - 1]
  if (assertion.conclusion.string !== conclusionStep.formula.string) return false
  if (assertion.assumptionList.length !== conclusionStep.dependencies.length) return false
  const steps = conclusionStep.dependencies.map(l => argument[l - 1])
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const formulaString = step.formula.string
    if (!assertion.assumptionList.find(a => a.string === formulaString)) return false
  }
  return true
}

/**
 * Validates a proof by analyzing the argument and its relation to the assertion
 * @param {*} assertion an object with an assumptionList and a conclusion
 * @param {*} argument a list of derivation steps
 */
export const validateProof = (assertion, argument) => {
  if (!argument || argument.length === 0) {
    throw new Error('No Argument given.')
  } else if (!isConclusionAssertive(assertion, argument)) {
    throw new Error('Argument does not assert Assertion.')
  }
  for (let i = 0; i < argument.length; i++) {
    const step = argument[i]
    const rule = DERIVATION_RULES.find(r => r.matchNotation(step.notation))
    if (!rule) {
      throw new Error(`Derivation Rule not found for: ${step.notation}`)
    }
    if (rule.name === 'Rule of Assumptions (A)') {
      // Assumption steps only reference themselves
      rule.validate(step)
    } else {
      // All others must ensure they have proper references
      const lines = step.notation.match(/\d+/g)
      const referenceSteps = lines.map(l => argument[l - 1])
      rule.validate(step, ...referenceSteps)
    }
  }
  return true
}
