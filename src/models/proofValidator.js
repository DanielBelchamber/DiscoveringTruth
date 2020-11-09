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

const validateDependencyChain = (dependencies, referenceDependencySet) => {
  const missingReferenceSet = new Set(dependencies.filter(a => !referenceDependencySet.has(a)))
  if (
    dependencies.length !== referenceDependencySet.size ||
    missingReferenceSet.size !== 0 ||
    dependencies.join(',') !== [...dependencies].sort().join(',')
  ) {
    throw new Error('Dependencies are incorrect.')
  } else {
    return true
  }
}

const validateMPP = (step, impStep, antStep) => {
  // validate the formula relationships
  const implication = impStep.formula
  if (implication.type !== FORMULA_TYPE.IMPLICATION) {
    throw new Error('First reference is not an implication.')
  }
  const antecedent = parseFormulaString(implication.left.string)
  const consequent = parseFormulaString(implication.right.string)
  if (antStep.formula.string !== antecedent.string) {
    throw new Error('Second reference is not the antecedent of the first.')
  } else if (step.formula.string !== consequent.string) {
    throw new Error('Step is not the consequent of the implecation.')
  }
  // validate dependency chain
  const referenceDependencySet = new Set([
    ...impStep.dependencies,
    ...antStep.dependencies
  ])
  return validateDependencyChain(step.dependencies, referenceDependencySet)
}

const validateMTT = (step, impStep, notConStep) => {
  // validate the formula relationships
  const implication = impStep.formula
  if (implication.type !== FORMULA_TYPE.IMPLICATION) {
    throw new Error('First reference is not an implication.')
  }
  const antecedent = parseFormulaString(implication.left.string)
  const notAntecedent = parseFormulaString(`-(${antecedent.string})`)
  const consequent = parseFormulaString(implication.right.string)
  const notConsequent = parseFormulaString(`-(${consequent.string})`)
  if (notConStep.formula.string !== notConsequent.string) {
    throw new Error('Second reference is not the negation of the consequent of the first.')
  } else if (step.formula.string !== notAntecedent.string) {
    throw new Error('Step is not the negation of the antecedent of the implecation.')
  }
  // validate dependency chain
  const referenceDependencySet = new Set([
    ...impStep.dependencies,
    ...notConStep.dependencies
  ])
  return validateDependencyChain(step.dependencies, referenceDependencySet)
}

const validateDNI = (step, refStep) => {
  // validate the formula relationship
  const doubleNegation = parseFormulaString(`--(${refStep.formula.string})`)
  if (step.formula.string !== doubleNegation.string) {
    throw new Error('Step formula is not the double negation of the reference formula.')
  }
  // validate dependency chain
  return validateDependencyChain(step.dependencies, new Set(refStep.dependencies))
}

const validateDNE = (step, refStep) => {
  // validate the formula relationship
  const doubleNegation = parseFormulaString(`--(${step.formula.string})`)
  if (refStep.formula.string !== doubleNegation.string) {
    throw new Error('The reference formula is not the double negation of step formula.')
  }
  // validate dependency chain
  return validateDependencyChain(step.dependencies, new Set(refStep.dependencies))
}

const validateCP = (step, antStep, conStep) => {
  // ensure first reference is an assumption that the second reference depends on
  const dependencyIndex = conStep.dependencies.indexOf(antStep.line)
  if (dependencyIndex === -1) {
    throw new Error('First reference must be a dependency of the second reference.')
  }
  if (antStep.notation !== 'A') {
    throw new Error('First reference must be an assumption.')
  }
  // validate the formula relationship
  if (parseFormulaString(step.formula.left.string).string !== antStep.formula.string) {
    throw new Error('First reference is not the antecedent of step formula.')
  } else if (parseFormulaString(step.formula.right.string).string !== conStep.formula.string) {
    throw new Error('Second reference is not the consequent of step formula.')
  }
  // validate dependency relationship
  const dependencies = [...conStep.dependencies]
  dependencies.splice(dependencyIndex, 1) // discharged assumption
  if (dependencies.join(',') !== step.dependencies.join(',')) {
    throw new Error('Dependencies are incorrect.')
  }
  return true
}

const validateCI = (step, leftStep, rightStep) => {
  // validate the formula relationship
  const left = parseFormulaString(step.formula.left.string)
  const right = parseFormulaString(step.formula.right.string)
  if (leftStep.formula.string !== left.string || rightStep.formula.string !== right.string) {
    throw new Error('References do not match the conjunction.')
  }
  // validate dependency chain
  const referenceDependencySet = new Set([
    ...leftStep.dependencies,
    ...rightStep.dependencies
  ])
  return validateDependencyChain(step.dependencies, referenceDependencySet)
}

const validateCE = (step, refStep) => {
  // validate the formula relationship
  const left = parseFormulaString(refStep.formula.left.string)
  const right = parseFormulaString(refStep.formula.right.string)
  if (step.formula.string !== left.string && step.formula.string !== right.string) {
    throw new Error('Step formula does not match the reference conjunction.')
  }
  // validate dependency chain
  return validateDependencyChain(step.dependencies, new Set(refStep.dependencies))
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
    name: 'Double Negation Introduction (DNI)',
    type: 'DNI',
    getNotation: line => `${line} DNI`,
    matchNotation: notation => notation.match(/^\d+( DNI)$/),
    validate: validateDNI
  },
  {
    name: 'Double Negation Elimination (DNE)',
    type: 'DNE',
    getNotation: line => `${line} DNE`,
    matchNotation: notation => notation.match(/^\d+( DNE)$/),
    validate: validateDNE
  },
  {
    name: 'Modus Ponendo Ponens (MPP)',
    type: 'MPP',
    getNotation: (impLine, antLine) => `${impLine},${antLine} MPP`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( MPP)$/),
    validate: validateMPP
  },
  {
    name: 'Modus Tollendo Tollens (MTT)',
    type: 'MTT',
    getNotation: (impLine, notConLine) => `${impLine},${notConLine} MTT`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( MTT)$/),
    validate: validateMTT
  },
  {
    name: 'Conditional Proof (CP)',
    type: 'CP',
    getNotation: (antLine, conLine) => `${antLine},${conLine} CP`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( CP)$/),
    validate: validateCP
  },
  {
    name: 'Conjunction Introduction (CI)',
    type: 'CI',
    getNotation: (leftLine, rightLine) => `${leftLine},${rightLine} CI`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( CI)$/),
    validate: validateCI
  },
  {
    name: 'Conjunction Elimination (CE)',
    type: 'CE',
    getNotation: line => `${line} CE`,
    matchNotation: notation => notation.match(/^\d+( CE)$/),
    validate: validateCE
  }
]

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
