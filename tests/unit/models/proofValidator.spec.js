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

describe('DERIVATION_RULES', () => {
  it('include: A, DNI, DNE, MPP, MTT, CP, CI, CE, DI', () => {
    expect(DERIVATION_RULES.map(r => r.type))
      .toEqual(['A', 'DNI', 'DNE', 'MPP', 'MTT', 'CP', 'CI', 'CE', 'DI'])
  })
})

describe('Rule of Assumptions (A)', () => {
  const ruleA = DERIVATION_RULES.find(r => r.type === 'A')

  it('has the correct name and type', () => {
    expect(ruleA.name).toBe('Rule of Assumptions (A)')
    expect(ruleA.type).toBe('A')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleA.getNotation()).toBe('A')
    expect(ruleA.matchNotation('A')).toBeTruthy()
    expect(ruleA.matchNotation('bogus')).toBeFalsy()
  })

  it('validates a correct assumption step', () => {
    const step = {
      dependencies: [34],
      line: 34,
      formula: parseFormulaString('P&Q'),
      notation: 'A'
    }
    expect(ruleA.validate(step)).toBeTruthy()
  })

  it('throws an error an assumption with incorrect dependencies', () => {
    const errorMessage = 'Assumption Step must rely on only itself.'

    let step = {
      dependencies: [],
      line: 2,
      formula: parseFormulaString('P&Q'),
      notation: 'A'
    }
    expect(() => { ruleA.validate(step) })
      .toThrowError(errorMessage)

    step = {
      dependencies: [1, 2],
      line: 2,
      formula: parseFormulaString('R'),
      notation: 'A'
    }
    expect(() => { ruleA.validate(step) })
      .toThrowError(errorMessage)

    step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('Sv-S'),
      notation: 'A'
    }
    expect(() => { ruleA.validate(step) })
      .toThrowError(errorMessage)
  })
})

describe('Double Negation Introduction (DNI)', () => {
  const ruleDNI = DERIVATION_RULES.find(r => r.type === 'DNI')

  const assumptionStep = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }

  const dniStep = {
    dependencies: [1],
    line: 2,
    formula: parseFormulaString('--P'),
    notation: '1 DNI'
  }

  it('has the correct name and type', () => {
    expect(ruleDNI.name).toBe('Double Negation Introduction (DNI)')
    expect(ruleDNI.type).toBe('DNI')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleDNI.getNotation(4)).toBe('4 DNI')
    expect(ruleDNI.matchNotation('13 DNI')).toBeTruthy()
    expect(ruleDNI.matchNotation('DNI')).toBeFalsy()
  })

  it('validates a correct DNI step', () => {
    expect(ruleDNI.validate(dniStep, assumptionStep)).toBeTruthy()
  })

  it('throws an error when step is not the double negation of the reference', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('-P'),
      notation: '1 DNI'
    }
    expect(() => { ruleDNI.validate(step, assumptionStep) })
      .toThrowError('Step formula is not the double negation of the reference formula.')
  })

  it('throws an error when dependencies are incorrect', () => {
    const step = {
      dependencies: [1, 2],
      line: 2,
      formula: parseFormulaString('--P'),
      notation: '1 DNI'
    }
    expect(() => { ruleDNI.validate(step, assumptionStep) })
      .toThrowError('Dependencies are incorrect.')
  })
})

describe('Double Negation Elimination (DNE)', () => {
  const ruleDNE = DERIVATION_RULES.find(r => r.type === 'DNE')

  const assumptionStep = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('--P'),
    notation: 'A'
  }

  const dneStep = {
    dependencies: [1],
    line: 2,
    formula: parseFormulaString('P'),
    notation: '1 DNE'
  }

  it('has the correct name and type', () => {
    expect(ruleDNE.name).toBe('Double Negation Elimination (DNE)')
    expect(ruleDNE.type).toBe('DNE')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleDNE.getNotation(4)).toBe('4 DNE')
    expect(ruleDNE.matchNotation('13 DNE')).toBeTruthy()
    expect(ruleDNE.matchNotation('DNE')).toBeFalsy()
  })

  it('validates a correct DNE step', () => {
    expect(ruleDNE.validate(dneStep, assumptionStep)).toBeTruthy()
  })

  it('throws an error when the reference is not the double negation of step formula', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('-P'),
      notation: '1 DNE'
    }
    expect(() => { ruleDNE.validate(step, assumptionStep) })
      .toThrowError('The reference formula is not the double negation of step formula.')
  })

  it('throws an error when dependencies are incorrect', () => {
    const step = {
      dependencies: [0],
      line: 2,
      formula: parseFormulaString('P'),
      notation: '1 DNE'
    }
    expect(() => { ruleDNE.validate(step, assumptionStep) })
      .toThrowError('Dependencies are incorrect.')
  })
})

describe('Modus Ponendo Ponens (MPP)', () => {
  const ruleMPP = DERIVATION_RULES.find(r => r.type === 'MPP')

  const implicationStep = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P>Q'),
    notation: 'A'
  }

  const antecedentStep = {
    dependencies: [2],
    line: 2,
    formula: parseFormulaString('P'),
    notation: 'A'
  }

  const mppStep1 = {
    dependencies: [1, 2],
    line: 3,
    formula: parseFormulaString('Q'),
    notation: '1,2 MPP'
  }

  const mppStep2 = {
    dependencies: [1, 2],
    line: 3,
    formula: parseFormulaString('R'),
    notation: '1,2 MPP'
  }

  const mppStep3 = {
    dependencies: [1],
    line: 3,
    formula: parseFormulaString('Q'),
    notation: '1,2 MPP'
  }

  it('has the correct name and type', () => {
    expect(ruleMPP.name).toBe('Modus Ponendo Ponens (MPP)')
    expect(ruleMPP.type).toBe('MPP')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleMPP.getNotation(7, 3)).toBe('7,3 MPP')
    expect(ruleMPP.matchNotation('72,33 MPP')).toBeTruthy()
    expect(ruleMPP.matchNotation('1 MPP')).toBeFalsy()
  })

  it('validates a correct MPP step', () => {
    expect(ruleMPP.validate(mppStep1, implicationStep, antecedentStep)).toBeTruthy()
  })

  it('throws an error when first reference is not an implication', () => {
    expect(() => { ruleMPP.validate(mppStep1, antecedentStep, implicationStep) })
      .toThrowError('First reference is not an implication.')
  })

  it('throws an error when second reference is not the antecedent', () => {
    expect(() => { ruleMPP.validate(mppStep1, implicationStep, mppStep1) })
      .toThrowError('Second reference is not the antecedent of the first.')
  })

  it('throws an error when step is not the consequent', () => {
    expect(() => { ruleMPP.validate(mppStep2, implicationStep, antecedentStep) })
      .toThrowError('Step is not the consequent of the implecation.')
  })

  it('throws an error when dependencies are incorrect', () => {
    expect(() => { ruleMPP.validate(mppStep3, implicationStep, antecedentStep) })
      .toThrowError('Dependencies are incorrect.')
  })
})

describe('Modus Ponendo Ponens (MTT)', () => {
  const ruleMTT = DERIVATION_RULES.find(r => r.type === 'MTT')

  const implicationStep = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P>Q'),
    notation: 'A'
  }

  const notConsequentStep = {
    dependencies: [2],
    line: 2,
    formula: parseFormulaString('-Q'),
    notation: 'A'
  }

  const mttStep = {
    dependencies: [1, 2],
    line: 3,
    formula: parseFormulaString('-P'),
    notation: '1,2 MTT'
  }

  it('has the correct name and type', () => {
    expect(ruleMTT.name).toBe('Modus Tollendo Tollens (MTT)')
    expect(ruleMTT.type).toBe('MTT')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleMTT.getNotation(7, 3)).toBe('7,3 MTT')
    expect(ruleMTT.matchNotation('72,33 MTT')).toBeTruthy()
    expect(ruleMTT.matchNotation('1 MTT')).toBeFalsy()
  })

  it('validates a correct MTT step', () => {
    expect(ruleMTT.validate(mttStep, implicationStep, notConsequentStep)).toBeTruthy()
  })

  it('throws an error when first reference is not an implication', () => {
    expect(() => { ruleMTT.validate(mttStep, mttStep, notConsequentStep) })
      .toThrowError('First reference is not an implication.')
  })

  it('throws an error when second reference is not the negation of the consequent', () => {
    expect(() => { ruleMTT.validate(mttStep, implicationStep, mttStep) })
      .toThrowError('Second reference is not the negation of the consequent of the first.')
  })

  it('throws an error when step is not the negation of the antecedent', () => {
    const step = {
      dependencies: [1, 2],
      line: 3,
      formula: parseFormulaString('-P&Q'),
      notation: '1,2 MTT'
    }
    expect(() => { ruleMTT.validate(step, implicationStep, notConsequentStep) })
      .toThrowError('Step is not the negation of the antecedent of the implecation.')
  })

  it('throws an error when dependencies are incorrect', () => {
    const step = {
      dependencies: [],
      line: 3,
      formula: parseFormulaString('-P'),
      notation: '1,2 MTT'
    }
    expect(() => { ruleMTT.validate(step, implicationStep, notConsequentStep) })
      .toThrowError('Dependencies are incorrect.')
  })
})

describe('Conditional Proof (CP)', () => {
  const ruleCP = DERIVATION_RULES.find(r => r.type === 'CP')

  const assumption1P = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }

  const cpStep2 = {
    dependencies: [],
    line: 2,
    formula: parseFormulaString('P>P'),
    notation: '1,1 CP'
  }

  it('has the correct name and type', () => {
    expect(ruleCP.name).toBe('Conditional Proof (CP)')
    expect(ruleCP.type).toBe('CP')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleCP.getNotation(7, 3)).toBe('7,3 CP')
    expect(ruleCP.matchNotation('72,33 CP')).toBeTruthy()
    expect(ruleCP.matchNotation('CP 3,4')).toBeFalsy()
  })

  it('validates a correct CP step', () => {
    const antStep = {
      dependencies: [2],
      line: 2,
      formula: parseFormulaString('-Q'),
      notation: 'A'
    }
    const conStep = {
      dependencies: [1, 2],
      line: 3,
      formula: parseFormulaString('-P'),
      notation: '1,2 MTT' // (1) P>Q
    }
    const step = {
      dependencies: [1],
      line: 4,
      formula: parseFormulaString('-Q>(-P)'),
      notation: '2,3 CP'
    }
    expect(ruleCP.validate(step, antStep, conStep)).toBeTruthy()
  })

  it('validates a correct CP step with double reference', () => {
    expect(ruleCP.validate(cpStep2, assumption1P, assumption1P)).toBeTruthy()
  })

  it('throws an error when the step formula is not an implication', () => {
    expect(() => { ruleCP.validate(assumption1P, assumption1P, assumption1P) })
      .toThrowError('Step formula is not an implication.')
  })

  it('throws an error when first reference is not the antecedent of the step', () => {
    const step = {
      dependencies: [],
      line: 2,
      formula: parseFormulaString('R>P'),
      notation: '1,1 CP'
    }
    expect(() => { ruleCP.validate(step, assumption1P, assumption1P) })
      .toThrowError('First reference is not the antecedent of step formula.')
  })

  it('throws an error when second reference is not the consequent of the step', () => {
    const step = {
      dependencies: [],
      line: 2,
      formula: parseFormulaString('P>Q'),
      notation: '1,1 CP'
    }
    expect(() => { ruleCP.validate(step, assumption1P, assumption1P) })
      .toThrowError('Second reference is not the consequent of step formula.')
  })

  it('throws an error when first reference is not a dependency of the second', () => {
    const antecedentStep = {
      dependencies: [2],
      line: 2,
      formula: parseFormulaString('Q'),
      notation: 'A'
    }
    const cpStep = {
      dependencies: [1],
      line: 3,
      formula: parseFormulaString('Q>P'),
      notation: '2,1 CP'
    }
    expect(() => { ruleCP.validate(cpStep, antecedentStep, assumption1P) })
      .toThrowError('First reference must be a dependency of the second reference.')
  })

  it('throws an error when first reference is not an assumption', () => {
    const antStep = {
      dependencies: [1],
      line: 1,
      formula: parseFormulaString('P'),
      notation: '3,4 MPP'
    }
    expect(() => { ruleCP.validate(cpStep2, antStep, assumption1P) })
      .toThrowError('First reference must be an assumption.')
  })

  it('throws an error when dependencies are incorrect', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('P>P'),
      notation: '1,1 CP'
    }
    expect(() => { ruleCP.validate(step, assumption1P, assumption1P) })
      .toThrowError('Dependencies are incorrect.')
  })
})

describe('Conjunction Introduction (CI)', () => {
  const ruleCI = DERIVATION_RULES.find(r => r.type === 'CI')

  const assumptionP = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }

  const assumptionQ = {
    dependencies: [2],
    line: 2,
    formula: parseFormulaString('Q'),
    notation: 'A'
  }

  const ciStep = {
    dependencies: [1, 2],
    line: 3,
    formula: parseFormulaString('P&Q'),
    notation: '1,2 CI'
  }

  it('has the correct name and type', () => {
    expect(ruleCI.name).toBe('Conjunction Introduction (CI)')
    expect(ruleCI.type).toBe('CI')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleCI.getNotation(11, 2)).toBe('11,2 CI')
    expect(ruleCI.matchNotation('3,7 CI')).toBeTruthy()
    expect(ruleCI.matchNotation('CI 1,2')).toBeFalsy()
  })

  it('validates a correct CI step', () => {
    expect(ruleCI.validate(ciStep, assumptionP, assumptionQ)).toBeTruthy()
  })

  it('throws an error when the step formula is not a conjunction', () => {
    const step = {
      dependencies: [1, 2],
      line: 3,
      formula: parseFormulaString('RvS'),
      notation: '1,2 CI'
    }
    expect(() => { ruleCI.validate(step, assumptionP, assumptionQ) })
      .toThrowError('Step formula is not a conjunction.')
  })

  it('throws an error when the step formula is not the conjunction of the references', () => {
    const step = {
      dependencies: [1, 2],
      line: 3,
      formula: parseFormulaString('R&S'),
      notation: '1,2 CI'
    }
    expect(() => { ruleCI.validate(step, assumptionP, assumptionQ) })
      .toThrowError('References do not match the conjunction.')
  })

  it('throws an error when the reference order does not match the conjunction', () => {
    const step = {
      dependencies: [1, 2],
      line: 3,
      formula: parseFormulaString('Q&P'),
      notation: '1,2 CI'
    }
    expect(() => { ruleCI.validate(step, assumptionP, assumptionQ) })
      .toThrowError('References do not match the conjunction.')
  })

  it('throws an error when dependencies are incorrect', () => {
    const step = {
      dependencies: [2],
      line: 3,
      formula: parseFormulaString('P&Q'),
      notation: '1,2 CI'
    }
    expect(() => { ruleCI.validate(step, assumptionP, assumptionQ) })
      .toThrowError('Dependencies are incorrect.')
  })
})

describe('Conjunction Elimination (CE)', () => {
  const ruleCE = DERIVATION_RULES.find(r => r.type === 'CE')

  const conjunctionAssumption = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P&Q'),
    notation: 'A'
  }

  it('has the correct name and type', () => {
    expect(ruleCE.name).toBe('Conjunction Elimination (CE)')
    expect(ruleCE.type).toBe('CE')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleCE.getNotation(4)).toBe('4 CE')
    expect(ruleCE.matchNotation('28 CE')).toBeTruthy()
    expect(ruleCE.matchNotation('3CE')).toBeFalsy()
  })

  it('validates a correct left CE step', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('P'),
      notation: '1 CE'
    }
    expect(ruleCE.validate(step, conjunctionAssumption)).toBeTruthy()
  })

  it('validates a correct right CE step', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('Q'),
      notation: '1 CE'
    }
    expect(ruleCE.validate(step, conjunctionAssumption)).toBeTruthy()
  })

  it('throws an error when the reference formula is not a conjunction', () => {
    const step = {
      dependencies: [1],
      line: 5,
      formula: parseFormulaString('R'),
      notation: '1 CE'
    }
    expect(() => { ruleCE.validate(step, step) })
      .toThrowError('Reference formula is not a conjunction.')
  })

  it('throws an error when the step formula is not contained within the reference conjunction', () => {
    const step = {
      dependencies: [1],
      line: 5,
      formula: parseFormulaString('R'),
      notation: '1 CE'
    }
    expect(() => { ruleCE.validate(step, conjunctionAssumption) })
      .toThrowError('Step formula is not contained within the reference conjunction.')
  })

  it('throws an error when dependencies are incorrect', () => {
    const step = {
      dependencies: [],
      line: 12,
      formula: parseFormulaString('P'),
      notation: '1 CE'
    }
    expect(() => { ruleCE.validate(step, conjunctionAssumption) })
      .toThrowError('Dependencies are incorrect.')
  })
})

describe('Disjunction Introduction (DI)', () => {
  const ruleDI = DERIVATION_RULES.find(r => r.type === 'DI')

  const assumptionP = {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }

  it('has the correct name and type', () => {
    expect(ruleDI.name).toBe('Disjunction Introduction (DI)')
    expect(ruleDI.type).toBe('DI')
  })

  it('has functional notation getter and matcher', () => {
    expect(ruleDI.getNotation(4)).toBe('4 DI')
    expect(ruleDI.matchNotation('28 DI')).toBeTruthy()
    expect(ruleDI.matchNotation('DI12')).toBeFalsy()
  })

  it('validates a correct left DI step', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('PvQ'),
      notation: '1 DI'
    }
    expect(ruleDI.validate(step, assumptionP)).toBeTruthy()
  })

  it('validates a correct right DI step', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('QvP'),
      notation: '1 DI'
    }
    expect(ruleDI.validate(step, assumptionP)).toBeTruthy()
  })

  it('throws an error when the step formula is not a disjunction', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('Q&P'),
      notation: '1 DI'
    }
    expect(() => { ruleDI.validate(step, assumptionP) })
      .toThrowError('Step formula is not a disjunction.')
  })

  it('throws an error when the reference is not contained within the disjunction', () => {
    const step = {
      dependencies: [1],
      line: 2,
      formula: parseFormulaString('RvS'),
      notation: '1 DI'
    }
    expect(() => { ruleDI.validate(step, assumptionP) })
      .toThrowError('Reference is not contained within the disjunction.')
  })

  it('throws an error when dependencies are incorrect', () => {
    const step = {
      dependencies: [],
      line: 2,
      formula: parseFormulaString('Pv-S'),
      notation: '1 DI'
    }
    expect(() => { ruleDI.validate(step, assumptionP) })
      .toThrowError('Dependencies are incorrect.')
  })
})
