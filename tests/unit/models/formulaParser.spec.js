import { parseFormulaString, constructAssertion } from '@/models/formulaParser.js'

describe('parseFormulaString', () => {
  it('parses a Proposition', () => {
    const formulaString = 'P'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Proposition')
    expect(formula.hasParentheses).toBeFalsy()
    expect(formula.toString()).toBe('P')
  })

  it('removes multiple parentheses from a Proposition', () => {
    const formulaString = '(((P)))'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Proposition')
    expect(formula.hasParentheses).toBeFalsy()
    expect(formula.toString()).toBe('P')
  })

  it('can parse a simple Negation', () => {
    const formulaString = '(-(R))'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Negation')
    expect(formula.hasParentheses).toBeFalsy()
    expect(formula.toString()).toBe('-R')
  })

  it('can parse a simple Conjunction', () => {
    const formulaString = '(P&Q)'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Conjunction')
    expect(formula.hasParentheses).toBeFalsy()
    expect(formula.toString()).toBe('P&Q')
  })

  it('can parse a simple Disjunction', () => {
    const formulaString = 'PvQ'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Disjunction')
    expect(formula.hasParentheses).toBeFalsy()
    expect(formula.toString()).toBe('PvQ')
  })

  it('can parse a simple Implication', () => {
    const formulaString = '(P)>Q'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Implication')
    expect(formula.hasParentheses).toBeFalsy()
    expect(formula.toString()).toBe('P>Q')
  })

  it('keeps necessary parentheses', () => {
    const formulaString = 'P>(P>Q)'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Implication')
    expect(formula.hasParentheses).toBeFalsy()
    expect(formula.right.hasParentheses).toBeTruthy()
    expect(formula.toString()).toBe('P>(P>Q)')
  })

  it('parses a complex formula string', () => {
    const formulaString = '(P>Q)&((-P)vP)>Q&-((-SvP)>Q)'
    const formula = parseFormulaString(formulaString)
    expect(formula.type).toBe('Implication')
    expect(formula.left.type).toBe('Conjunction')
    expect(formula.right.type).toBe('Conjunction')
    expect(formula.toString()).toBe('(P>Q)&(-PvP)>Q&-(-SvP>Q)')
  })

  it('can detect a syntax error', () => {
    const formulaString = 'P>&(PQ)'
    expect(() => { parseFormulaString(formulaString) })
      .toThrowError(`Formula is not well-formed: ${formulaString}`)
  })

  it('can detect an implication ambiguity error', () => {
    const formulaString = 'P>S&Q>R'
    expect(() => { parseFormulaString(formulaString) })
      .toThrowError(`Formula is ambiguous: ${formulaString}`)
  })

  it('can detect a conjunction/disjunction ambiguity error', () => {
    const formulaString = 'P&Qv-R'
    expect(() => { parseFormulaString(formulaString) })
      .toThrowError(`Formula is ambiguous: ${formulaString}`)
  })
})

describe('constructAssertion', () => {
  it('correctly parses all assumptions and the conclusion', () => {
    const assumption0 = 'P>(P>Q)'
    const assumption1 = 'P'
    const conclusion = 'Q'

    const assertion = constructAssertion([assumption0, assumption1], conclusion)

    // assumption0
    expect(assertion.assumptionList[0].toString()).toBe(assumption0)
    expect(assertion.assumptionList[0].type).toBe('Implication')
    expect(assertion.assumptionList[0].right.hasParentheses).toBeTruthy()
    expect(assertion.assumptionList[0].right.type).toBe('Implication')
    // assumption1
    expect(assertion.assumptionList[1].toString()).toBe(assumption1)
    expect(assertion.assumptionList[1].type).toBe('Proposition')
    // conclusion
    expect(assertion.conclusion.toString()).toBe(conclusion)
    expect(assertion.conclusion.type).toBe('Proposition')
  })
})
