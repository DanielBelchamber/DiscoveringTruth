const SUBSTITUTION_RULES = [
  // Step 1: replace propositional variables with numbers
  /(P|Q|R|S)/,
  // Step 2: recursively analyze parenthetical formula strings
  /\(([^()]+)\)/,
  // Step 3: identify negations
  /-\d+/,
  // Step 4: identify conjunction and disjunction
  /\d+(&|v)\d+/,
  // Step 5: identify implications
  /\d+(>)\d+/
]

const analyzeFormulaString = (formulaString, elementList) => {
  let referenceString = formulaString
  let match
  SUBSTITUTION_RULES.forEach((rule, ruleIndex) => {
    while ((match = referenceString.match(rule)) !== null) {
      // extract matched element from referenceString
      const symbolList = referenceString.split('')
      const matchedList = symbolList.splice(match.index, match[0].length)
      let element = matchedList.join('')
      // recursively analyze parenthetical formula string
      if (ruleIndex === 1) {
        const parentheticalString = element.slice(1, -1)
        const analysis = analyzeFormulaString(parentheticalString, elementList)
        elementList = [...analysis.elementList]
        element = `(${elementList[analysis.rootIndex]})`
      }
      // add element to elementList (if not already present)
      let elementIndex = elementList.indexOf(element)
      if (elementIndex === -1) {
        elementIndex = elementList.length
        elementList.push(element)
      }
      // inject element reference (elementIndex) into referenceString
      symbolList.splice(match.index, 0, elementIndex)
      referenceString = symbolList.join('')
    }
  })
  // Once all SUBSTITUTION_RULES have been executed, the result should be a single index reference
  if (isNaN(referenceString)) {
    // This does not catch ambiguity errors (see constructFormula)
    throw new SyntaxError(`Formula is not well-formed: ${formulaString}`)
  }
  return {
    elementList,
    rootIndex: +referenceString
  }
}

const FORMULA_NODE_TYPE = Object.freeze({
  PROPOSITION: 'Proposition',
  PARENTHESES: 'Parentheses',
  NEGATION: 'Negation',
  CONJUNCTION: 'Conjunction',
  DISJUNCTION: 'Disjunction',
  IMPLICATION: 'Implication'
})

const FORMULA_NODES = [
  {
    rule: /^(P|Q|R|S)$/, // Leaf
    type: FORMULA_NODE_TYPE.PROPOSITION,
    symbol: null
  },
  {
    rule: /^\(.+\)$/, // Neither (formula construction only)
    type: FORMULA_NODE_TYPE.PARENTHESES,
    symbol: null
  },
  {
    rule: /^-\d+$/, // Branch (right)
    type: FORMULA_NODE_TYPE.NEGATION,
    symbol: '-'
  },
  {
    rule: /^\d+(&)\d+$/, // Branch (left, right)
    type: FORMULA_NODE_TYPE.CONJUNCTION,
    symbol: '&'
  },
  {
    rule: /^\d+(v)\d+$/, // Branch (left, right)
    type: FORMULA_NODE_TYPE.DISJUNCTION,
    symbol: 'v'
  },
  {
    rule: /^\d+(>)\d+$/, // Branch (left, right)
    type: FORMULA_NODE_TYPE.IMPLICATION,
    symbol: '>'
  }
]

const constructFormula = (index, elementList, parentType) => {
  const element = elementList[index]
  const node = FORMULA_NODES.find(node => element.match(node.rule))
  const matchList = element.match(/\d+/g)
  let hasParentheses, centerIndex, formulaString
  let left, center, right
  switch (node.type) {
    case FORMULA_NODE_TYPE.PROPOSITION:
      return {
        type: node.type,
        hasParentheses: false,
        string: element
      }
    case FORMULA_NODE_TYPE.PARENTHESES:
      centerIndex = elementList.indexOf(element.slice(1, -1))
      center = constructFormula(centerIndex, elementList, parentType)
      hasParentheses =
        parentType !== null &&
        center.type !== FORMULA_NODE_TYPE.PROPOSITION &&
        center.type !== FORMULA_NODE_TYPE.NEGATION &&
        !(parentType === FORMULA_NODE_TYPE.IMPLICATION &&
          (center.type === FORMULA_NODE_TYPE.CONJUNCTION || center.type === FORMULA_NODE_TYPE.DISJUNCTION))
      return {
        ...center,
        hasParentheses,
        string: hasParentheses ? `(${center.string})` : center.string
      }
    case FORMULA_NODE_TYPE.NEGATION:
      right = constructFormula(+matchList[0], elementList, node.type)
      return {
        type: node.type,
        hasParentheses: false,
        right,
        string: `${node.symbol}${right.string}`
      }
    case FORMULA_NODE_TYPE.CONJUNCTION:
    case FORMULA_NODE_TYPE.DISJUNCTION:
      left = constructFormula(+matchList[0], elementList, node.type)
      right = constructFormula(+matchList[1], elementList, node.type)
      formulaString = `${left.string}${node.symbol}${right.string}`
      if
      (
        (!left.hasParentheses &&
          (left.type === FORMULA_NODE_TYPE.CONJUNCTION || left.type === FORMULA_NODE_TYPE.DISJUNCTION)) ||
        (!right.hasParentheses &&
          (right.type === FORMULA_NODE_TYPE.CONJUNCTION || right.type === FORMULA_NODE_TYPE.DISJUNCTION))
      ) {
        throw new SyntaxError(`Formula is ambiguous: ${formulaString}`)
      }
      return {
        type: node.type,
        hasParentheses: false,
        left,
        right,
        string: formulaString
      }
    case FORMULA_NODE_TYPE.IMPLICATION:
      left = constructFormula(+matchList[0], elementList, node.type)
      right = constructFormula(+matchList[1], elementList, node.type)
      formulaString = `${left.string}${node.symbol}${right.string}`
      if
      (
        (!left.hasParentheses && left.type === FORMULA_NODE_TYPE.IMPLICATION) ||
        (!right.hasParentheses && right.type === FORMULA_NODE_TYPE.IMPLICATION)
      ) {
        throw new SyntaxError(`Formula is ambiguous: ${formulaString}`)
      }
      return {
        type: node.type,
        hasParentheses: false,
        left,
        right,
        string: formulaString
      }
    // no default
  }
}

/**
 * Parses a formulaString into a tree structure.
 * @param {String} formulaString a symbolic propositional formula
 */
export const parseFormulaString = formulaString => {
  const { rootIndex, elementList } = analyzeFormulaString(formulaString, [])
  return constructFormula(rootIndex, elementList, null)
}

/**
 * Creates an assertion that claims the given conclusion follows from the given list of assumptions.
 * @param {[String]} assumptionList a list of formula strings
 * @param {String} conclusion a formula string
 */
export const constructAssertion = (assumptionList, conclusion) => {
  return {
    assumptionList: assumptionList.map(parseFormulaString),
    conclusion: parseFormulaString(conclusion)
  }
}
