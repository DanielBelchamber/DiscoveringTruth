import { validateProof, DERIVATION_RULES } from '@/models/proofValidator.js'
import { constructAssertion, parseFormulaString } from '@/models/formulaParser.js'

describe('validateProof', () => {
  const assumptionAssertion = constructAssertion(['P'], 'P')
  const assumptionArgument = [
    {
      dependencies: [1],
      line: 1,
      formula: parseFormulaString('P'),
      notation: 'A'
    }
  ]

  const mppAssertion = constructAssertion(['P>(P>Q)', 'P'], 'Q')
  const mppArgument = [
    {
      dependencies: [1],
      line: 1,
      formula: parseFormulaString('P>(P>Q)'),
      notation: 'A'
    },
    {
      dependencies: [2],
      line: 2,
      formula: parseFormulaString('P'),
      notation: 'A'
    },
    {
      dependencies: [1, 2],
      line: 3,
      formula: parseFormulaString('P>Q'),
      notation: '1,2 MPP'
    },
    {
      dependencies: [1, 2],
      line: 4,
      formula: parseFormulaString('Q'),
      notation: '3,2 MPP'
    }
  ]

  it('validates a proof with derivation rules: A', () => {
    expect(validateProof(assumptionAssertion, assumptionArgument)).toBeTruthy()
  })

  it('validates a proof with derivation rules: A, MPP', () => {
    expect(validateProof(mppAssertion, mppArgument)).toBeTruthy()
  })

  it('throws an error when no argument is given', () => {
    expect(() => { validateProof(assumptionAssertion, []) })
      .toThrowError('No Argument given.')
  })

  it('throws an error when argument conclusion formula does not match assertion', () => {
    expect(() => { validateProof(mppAssertion, assumptionArgument) })
      .toThrowError('Argument does not assert Assertion.')
  })

  it('throws an error when argument conclusion dependencies are not the same length as assertion assumptions', () => {
    const assertion = constructAssertion(['P', 'Q'], 'P')
    expect(() => { validateProof(assertion, assumptionArgument) })
      .toThrowError('Argument does not assert Assertion.')
  })

  it('throws an error when argument conclusion has dependencies that are not assertion assumptions', () => {
    const argument = [
      {
        dependencies: [1],
        line: 1,
        formula: parseFormulaString('Q&R'),
        notation: 'A'
      },
      {
        dependencies: [1],
        line: 2,
        formula: parseFormulaString('P'),
        notation: 'A'
      }
    ]
    expect(() => { validateProof(assumptionAssertion, argument) })
      .toThrowError('Argument does not assert Assertion.')
  })

  it('throws an error when argument step has unrecognized notation', () => {
    const argument = [
      {
        dependencies: [1],
        line: 2,
        formula: parseFormulaString('P'),
        notation: 'BOGUS'
      }
    ]
    expect(() => { validateProof(assumptionAssertion, argument) })
      .toThrowError('Derivation Rule not found for: BOGUS')
  })
})
