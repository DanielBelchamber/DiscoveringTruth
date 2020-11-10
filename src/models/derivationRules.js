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

const validateCP = (step, antStep, conStep) => {
  // validate the formula relationship
  if (step.formula.type !== FORMULA_TYPE.IMPLICATION) {
    throw new Error('Step formula is not an implication.')
  } else if (antStep.notation !== 'A') {
    throw new Error('First reference must be an assumption.')
  } else if (parseFormulaString(step.formula.left.string).string !== antStep.formula.string) {
    throw new Error('First reference is not the antecedent of step formula.')
  } else if (parseFormulaString(step.formula.right.string).string !== conStep.formula.string) {
    throw new Error('Second reference is not the consequent of step formula.')
  }
  // validate dependency relationship
  const dependencyIndex = conStep.dependencies.indexOf(antStep.line)
  if (dependencyIndex === -1) {
    throw new Error('First reference must be a dependency of the second reference.')
  }
  const dependencies = [...conStep.dependencies]
  dependencies.splice(dependencyIndex, 1) // discharged assumption
  if (dependencies.join(',') !== step.dependencies.join(',')) {
    throw new Error('Dependencies are incorrect.')
  }
  return true
}

const validateCI = (step, leftStep, rightStep) => {
  // validate the formula relationship
  if (step.formula.type !== FORMULA_TYPE.CONJUNCTION) {
    throw new Error('Step formula is not a conjunction.')
  }
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
  if (refStep.formula.type !== FORMULA_TYPE.CONJUNCTION) {
    throw new Error('Reference formula is not a conjunction.')
  }
  const left = parseFormulaString(refStep.formula.left.string)
  const right = parseFormulaString(refStep.formula.right.string)
  if (step.formula.string !== left.string && step.formula.string !== right.string) {
    throw new Error('Step formula is not contained within the reference conjunction.')
  }
  // validate dependency chain
  return validateDependencyChain(step.dependencies, new Set(refStep.dependencies))
}

const validateDI = (step, refStep) => {
  // validate the formula relationship
  if (step.formula.type !== FORMULA_TYPE.DISJUNCTION) {
    throw new Error('Step formula is not a disjunction.')
  }
  const left = parseFormulaString(step.formula.left.string)
  const right = parseFormulaString(step.formula.right.string)
  if (refStep.formula.string !== left.string && refStep.formula.string !== right.string) {
    throw new Error('Reference is not contained within the disjunction.')
  }
  // validate dependency chain
  return validateDependencyChain(step.dependencies, new Set(refStep.dependencies))
}

const validateDE = (step, disStep, LAStep, LCStep, RAStep, RCStep) => {
  // validate the formula relationship
  if (disStep.formula.type !== FORMULA_TYPE.DISJUNCTION) {
    throw new Error('Reference 1 is not a disjunction.')
  }
  const left = parseFormulaString(disStep.formula.left.string)
  const right = parseFormulaString(disStep.formula.right.string)
  if (LAStep.formula.string !== left.string) {
    throw new Error('Left Assumption (reference 2) does not match the disjunction.')
  } else if (LAStep.notation !== 'A') {
    throw new Error('Left Assumption (reference 2) is not an assumption.')
  } else if (step.formula.string !== LCStep.formula.string) {
    throw new Error('Left Conclusion (reference 3) is not the equivalent to step formula.')
  } else if (RAStep.formula.string !== right.string) {
    throw new Error('Right Assumption (reference 4) does not match the disjunction.')
  } else if (RAStep.notation !== 'A') {
    throw new Error('Right Assumption (reference 4) is not an assumption.')
  } else if (step.formula.string !== RCStep.formula.string) {
    throw new Error('Right Conclusion (reference 5) is not the equivalent to step formula.')
  }
  // validate dependency chain
  const leftIndex = LCStep.dependencies.indexOf(LAStep.line)
  const rightIndex = RCStep.dependencies.indexOf(RAStep.line)
  if (disStep.dependencies.indexOf(LAStep.line) !== -1) {
    throw new Error('Disjunction (reference 1) incorrectly depends on Left Assumption (reference 2).')
  } else if (disStep.dependencies.indexOf(RAStep.line) !== -1) {
    throw new Error('Disjunction (reference 1) incorrectly depends on Right Assumption (reference 4).')
  } else if (leftIndex === -1) {
    throw new Error('Left Conclusion (reference 3) does not depend on Left Assumption (reference 2).')
  } else if (LCStep.dependencies.indexOf(RAStep.line) !== -1) {
    throw new Error('Left Conclusion (reference 3) incorrectly depends on Right Assumption (reference 4).')
  } else if (rightIndex === -1) {
    throw new Error('Right Conclusion (reference 5) does not depend on Right Assumption (reference 4).')
  } else if (RCStep.dependencies.indexOf(LAStep.line) !== -1) {
    throw new Error('Right Conclusion (reference 5) incorrectly depends on Left Assumption (reference 2).')
  }
  const leftDependencies = [...LCStep.dependencies]
  leftDependencies.splice(leftIndex, 1)
  const rightDependencies = [...RCStep.dependencies]
  rightDependencies.splice(rightIndex, 1)
  const referenceDependencySet = new Set([
    ...disStep.dependencies,
    ...leftDependencies,
    ...rightDependencies
  ])
  return validateDependencyChain(step.dependencies, referenceDependencySet)
}

const validateRAA = (step, assumptionStep, contradictionStep) => {
  // validate the formula relationship
  const assumptionString = parseFormulaString(`-(${assumptionStep.formula.string})`).string
  if (step.formula.string !== assumptionString) {
    throw new Error('Step is not the negation of the first reference.')
  } else if (assumptionStep.notation !== 'A') {
    throw new Error('First reference must be an assumption.')
  }
  const leftString = parseFormulaString(`-(${contradictionStep.formula.left.string})`).string
  const rightString = parseFormulaString(contradictionStep.formula.right.string).string
  if (contradictionStep.formula.type !== FORMULA_TYPE.CONJUNCTION || leftString !== rightString) {
    throw new Error('Second reference is not a formal contradiction.')
  }
  // validate dependency relationship
  const dependencyIndex = contradictionStep.dependencies.indexOf(assumptionStep.line)
  if (dependencyIndex === -1) {
    throw new Error('First reference must be a dependency of the second reference.')
  }
  const dependencies = [...contradictionStep.dependencies]
  dependencies.splice(dependencyIndex, 1) // discharged assumption
  if (dependencies.join(',') !== step.dependencies.join(',')) {
    throw new Error('Dependencies are incorrect.')
  }
  return true
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
    getNotation: (imp, ant) => `${imp},${ant} MPP`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( MPP)$/),
    validate: validateMPP
  },
  {
    name: 'Modus Tollendo Tollens (MTT)',
    type: 'MTT',
    getNotation: (imp, notCon) => `${imp},${notCon} MTT`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( MTT)$/),
    validate: validateMTT
  },
  {
    name: 'Conditional Proof (CP)',
    type: 'CP',
    getNotation: (ant, con) => `${ant},${con} CP`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( CP)$/),
    validate: validateCP
  },
  {
    name: 'Conjunction Introduction (CI)',
    type: 'CI',
    getNotation: (left, right) => `${left},${right} CI`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( CI)$/),
    validate: validateCI
  },
  {
    name: 'Conjunction Elimination (CE)',
    type: 'CE',
    getNotation: line => `${line} CE`,
    matchNotation: notation => notation.match(/^\d+( CE)$/),
    validate: validateCE
  },
  {
    name: 'Disjunction Introduction (DI)',
    type: 'DI',
    getNotation: line => `${line} DI`,
    matchNotation: notation => notation.match(/^\d+( DI)$/),
    validate: validateDI
  },
  {
    name: 'Disjunction Elimination (DE)',
    type: 'DE',
    getNotation: (dis, LA, LC, RA, RC) => `${dis},${LA},${LC},${RA},${RC} DE`,
    matchNotation: notation => notation.match(/^\d+(,)\d+(,)\d+(,)\d+(,)\d+( DE)$/),
    validate: validateDE
  },
  {
    name: 'Reductio Ad Absurdum (RAA)',
    type: 'RAA',
    getNotation: (assumption, contradiction) => `${assumption},${contradiction} RAA`,
    matchNotation: notation => notation.match(/^\d+(,)\d+( RAA)$/),
    validate: validateRAA
  }
]
