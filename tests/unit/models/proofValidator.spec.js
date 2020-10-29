import { validateProof } from '@/models/proofValidator.js'
import { constructAssertion, parseFormulaString } from '@/models/formulaParser.js'

const assumptionAssertion = constructAssertion(['P'], 'P')
const mppAssertion = constructAssertion(['P>(P>Q)', 'P'], 'Q')

const assumptionArgument = [
  {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }
]

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

describe('validateProof', () => {
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

  it('returns false for Assumption Step when it has no dependencies', () => {
    const argument = [
      {
        dependencies: [],
        line: 1,
        formula: parseFormulaString('P'),
        notation: 'A'
      }
    ]
    expect(validateProof(assumptionAssertion, argument)).toBeFalsy()
  })

  it('returns false for MPP Step when first reference is not an implication', () => {
    const assertion = constructAssertion(['P>Q', 'P'], 'Q')
    const argument = [
      {
        dependencies: [1],
        line: 1,
        formula: parseFormulaString('P>Q'),
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
        formula: parseFormulaString('Q'),
        notation: '2,1 MPP'
      }
    ]
    expect(validateProof(assertion, argument)).toBeFalsy()
  })

  it('returns false for MPP Step when second reference is not the antecedent of the first reference', () => {
    const assertion = constructAssertion(['P>Q', 'P'], 'Q')
    const argument = [
      {
        dependencies: [1],
        line: 1,
        formula: parseFormulaString('P>Q'),
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
        formula: parseFormulaString('Q'),
        notation: '1,1 MPP'
      }
    ]
    expect(validateProof(assertion, argument)).toBeFalsy()
  })

  it('returns false for MPP Step when step formula is not the consequent of the first reference', () => {
    const assertion = constructAssertion(['P>(P>Q)', 'P'], 'Q')
    const argument = [
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
        formula: parseFormulaString('Q'),
        notation: '1,2 MPP'
      }
    ]
    expect(validateProof(assertion, argument)).toBeFalsy()
  })

  it('returns false for MPP Step when dependencies do not match reference dependencies', () => {
    const assertion = constructAssertion(['P>Q', 'P'], 'Q')
    const argument = [
      {
        dependencies: [1],
        line: 1,
        formula: parseFormulaString('P>Q'),
        notation: 'A'
      },
      {
        dependencies: [2],
        line: 2,
        formula: parseFormulaString('P'),
        notation: 'A'
      },
      {
        dependencies: [1],
        line: 3,
        formula: parseFormulaString('Q'),
        notation: '1,2 MPP'
      }
    ]
    expect(validateProof(assertion, argument)).toBeFalsy()
  })

  it('returns false for MPP Step when dependencies are not sorted', () => {
    const assertion = constructAssertion(['P>Q', 'P'], 'Q')
    const argument = [
      {
        dependencies: [1],
        line: 1,
        formula: parseFormulaString('P>Q'),
        notation: 'A'
      },
      {
        dependencies: [2],
        line: 2,
        formula: parseFormulaString('P'),
        notation: 'A'
      },
      {
        dependencies: [2, 1],
        line: 3,
        formula: parseFormulaString('Q'),
        notation: '1,2 MPP'
      }
    ]
    expect(validateProof(assertion, argument)).toBeFalsy()
  })
})
