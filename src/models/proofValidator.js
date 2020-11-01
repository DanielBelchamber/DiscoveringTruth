import { parseFormulaString } from '@/models/formulaParser.js'

const FORMULA_TYPE = Object.freeze({
  PROPOSITION: 'Proposition',
  NEGATION: 'Negation',
  CONJUNCTION: 'Conjunction',
  DISJUNCTION: 'Disjunction',
  IMPLICATION: 'Implication'
})

const validateAssumption = step => {
  if (step.dependencies.length !== 1 || step.dependencies[0] !== step.line) {
    throw new Error('Assumption Step must rely on only itself.')
  } else {
    return true
  }
}

const validateMPP = (step, implicationStep, antecedentStep) => {
  // validate the formula relationships
  const implication = implicationStep.formula
  if (implication.type !== FORMULA_TYPE.IMPLICATION) {
    throw new Error('First reference is not an implication.')
  }
  const antecedent = parseFormulaString(implication.left.toString())
  const consequent = parseFormulaString(implication.right.toString())
  if (antecedentStep.formula.toString() !== antecedent.toString()) {
    throw new Error('Second reference is not the antecedent of the first.')
  } else if (step.formula.toString() !== consequent.toString()) {
    throw new Error('Step is not the consequent of the implecation.')
  }

  // validate dependency chain
  const dependencies = step.dependencies
  const referenceDependencySet = new Set([
    ...implicationStep.dependencies,
    ...antecedentStep.dependencies
  ])
  const missingReferenceSet = new Set(dependencies.filter(a => !referenceDependencySet.has(a)))
  if (
    dependencies.length !== referenceDependencySet.size ||
    missingReferenceSet.size !== 0 ||
    dependencies.join(',') !== [...dependencies].sort().join()
  ) {
    throw new Error('Dependencies are incorrect.')
  } else {
    return true
  }
}

export const DERIVATION_RULES = [
  {
    name: 'Rule of Assumptions (A)',
    type: 'A',
    getNotation: () => 'A',
    matchNotation: notation => notation === 'A',
    validate: validateAssumption
  },
  {
    name: 'Modus Ponendo Ponens (MPP)',
    type: 'MPP',
    getNotation: (impLine, antLine) => `${impLine},${antLine} MPP`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( MPP)$/),
    validate: validateMPP
  }
]

const isConclusionAssertive = (assertion, argument) => {
  const conclusionStep = argument[argument.length - 1]
  if (assertion.conclusion.toString() !== conclusionStep.formula.toString()) return false
  const steps = conclusionStep.dependencies.map(l => argument[l - 1])
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const formulaString = step.formula.toString()
    if (!assertion.assumptionList.find(a => a.toString() === formulaString)) return false
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
    if (rule.name === 'Rule of Assumptions (A)') {
      // Assumption steps only reference themselves
      rule.validate(step)
    } else {
      // All others must ensure they have proper references
      const lines = step.notation.match(/\d+/g)
      const steps = lines.map(l => argument[l - 1])
      rule.validate(step, ...steps)
    }
  }
  return true
}
