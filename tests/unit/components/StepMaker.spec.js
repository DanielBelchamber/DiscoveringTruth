import { shallowMount } from '@vue/test-utils'
import StepMaker from '@/components/StepMaker.vue'
import { parseFormulaString } from '@/models/formulaParser.js'
import { DERIVATION_RULES } from '@/models/derivationRules.js'

const implicationAssumptionStep = {
  dependencies: [1],
  line: 1,
  formula: parseFormulaString('P>Q'),
  notation: 'A'
}

const antecedentAssumptionStep = {
  dependencies: [2],
  line: 2,
  formula: parseFormulaString('P'),
  notation: 'A'
}

describe('StepMaker.vue', () => {
  it('renders form with formula input and submit', () => {
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument: [],
        rule: DERIVATION_RULES.find(r => r.type === 'A')
      },
      data: () => ({ formulaString: 'P' })
    })
    expect(wrapper.element.tagName).toBe('form'.toUpperCase())
    const label = wrapper.find('.formula label')
    expect(label.attributes('for')).toBe('formula')
    expect(label.text()).toBe('Formula:')
    const input = wrapper.find('.formula input')
    expect(input.element.id).toBe('formula')
    expect(input.attributes('type')).toBe('text')
    expect(input.element.value).toBe('P')
    const submit = wrapper.find('input[type=submit]')
    expect(submit.exists()).toBeTruthy()
    expect(submit.element.value).toBe('Commit Step')
  })

  it('calls commit when form is submitted', async () => {
    const commit = jest.spyOn(StepMaker.methods, 'commit')
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument: [],
        rule: DERIVATION_RULES.find(r => r.type === 'A')
      },
      data: () => ({ formulaString: 'P' })
    })
    await wrapper.find('form').trigger('submit.prevent')
    expect(commit).toBeCalled()
  })

  it('conditionally renders MPP references', () => {
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument: [implicationAssumptionStep, antecedentAssumptionStep],
        rule: DERIVATION_RULES.find(r => r.type === 'MPP')
      },
      data: () => ({ formulaString: '' })
    })
    const references = wrapper.findAll('p.reference')
    expect(references.length).toBe(2)
    expect(references.at(0).find('label').text()).toBe('Implication Step:')
    expect(references.at(1).find('label').text()).toBe('Antecedent Step:')
    const implication = wrapper.find('input#implication')
    expect(implication.attributes('type')).toBe('number')
    expect(implication.attributes('min')).toBe('1')
    expect(implication.attributes('max')).toBe('2')
    const antecedent = wrapper.find('input#antecedent')
    expect(antecedent.attributes('type')).toBe('number')
    expect(antecedent.attributes('min')).toBe('1')
    expect(antecedent.attributes('max')).toBe('2')
  })

  it('changing reference number updates appropriate referenceList value', () => {
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument: [implicationAssumptionStep, antecedentAssumptionStep],
        rule: DERIVATION_RULES.find(r => r.type === 'MPP')
      },
      data: () => ({ formulaString: '' })
    })
    wrapper.find('input#antecedent').setValue(2)
    expect(wrapper.vm.referenceList[1].value).toBe('2')
  })
})

describe('computed: formula', () => {
  it('returns parsed formula when string is well-formed', () => {
    const localThis = { formulaString: '(P>(P>Q))' }
    expect(StepMaker.computed.formula.call(localThis).string).toBe('P>(P>Q)')
  })

  it('returns null when string is not well-formed', () => {
    const localThis = { formulaString: '' }
    expect(StepMaker.computed.formula.call(localThis)).toBe(null)
  })
})

describe('computed: referenceList', () => {
  it('rule.type === A: returns empty array', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'A') }
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual([])
  })

  it('rule.type === DNI: returns configuration for the reference', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'DNI') }
    const referenceList = [
      { id: 'reference', label: 'Reference Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === DNE: returns configuration for the reference', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'DNE') }
    const referenceList = [
      { id: 'reference', label: 'Reference Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === MPP: returns configuration for implication and antecedent references', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'MPP') }
    const referenceList = [
      { id: 'implication', label: 'Implication Step:', value: null },
      { id: 'antecedent', label: 'Antecedent Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === MTT: returns configuration for implication and consequent negation references', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'MTT') }
    const referenceList = [
      { id: 'implication', label: 'Implication Step:', value: null },
      { id: 'notConsequent', label: 'Consequent Negation Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === CP: returns configuration for antecedent assumption and consequent references', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'CP') }
    const referenceList = [
      { id: 'antecedent', label: 'Antecedent Assumption Step:', value: null },
      { id: 'consequent', label: 'Consequent Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === CI: returns configuration for left and right references', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'CI') }
    const referenceList = [
      { id: 'left', label: 'Left Step:', value: null },
      { id: 'right', label: 'Right Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === CE: returns configuration for the reference', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'CE') }
    const referenceList = [
      { id: 'reference', label: 'Reference Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === DI: returns configuration for the reference', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'DI') }
    const referenceList = [
      { id: 'reference', label: 'Reference Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === DE: returns configuration for all five references', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'DE') }
    const referenceList = [
      { id: 'disjunction', label: 'Disjunction Step:', value: null },
      { id: 'leftAssumption', label: 'Left Assumption Step:', value: null },
      { id: 'leftConclusion', label: 'Left Conclusion Step:', value: null },
      { id: 'rightAssumption', label: 'Right Assumption Step:', value: null },
      { id: 'rightConclusion', label: 'Right Conclusion Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })

  it('rule.type === RAA: returns configuration for assumption and contradiction references', () => {
    const localThis = { rule: DERIVATION_RULES.find(r => r.type === 'RAA') }
    const referenceList = [
      { id: 'assumption', label: 'Assumption Step:', value: null },
      { id: 'contradiction', label: 'Contradiction Step:', value: null }
    ]
    expect(StepMaker.computed.referenceList.call(localThis)).toEqual(referenceList)
  })
})

describe('methods: commit', () => {
  it('emits Assumption (A) step', () => {
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument: [],
        rule: DERIVATION_RULES.find(r => r.type === 'A')
      },
      data: () => ({ formulaString: '(P>Q)>R&S' })
    })
    const aStep = {
      dependencies: [1],
      line: 1,
      formula: parseFormulaString('(P>Q)>R&S'),
      notation: 'A'
    }
    wrapper.vm.commit()
    expect(wrapper.emitted('commit')[0]).toEqual([aStep])
  })

  it('emits MPP step', () => {
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
        formula: parseFormulaString('P>Q'),
        notation: '1,2 MPP'
      }
    ]
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument,
        rule: DERIVATION_RULES.find(r => r.type === 'MPP')
      },
      data: () => ({ formulaString: 'Q' })
    })
    const mppStep = {
      dependencies: [1, 2],
      line: 4,
      formula: parseFormulaString('Q'),
      notation: '3,2 MPP'
    }
    wrapper.find('input#implication').setValue(3)
    wrapper.find('input#antecedent').setValue(2)
    wrapper.vm.commit()
    expect(wrapper.emitted('commit')[0]).toEqual([mppStep])
  })

  it('emits CP step', () => {
    const argument = [
      {
        dependencies: [1],
        line: 1,
        formula: parseFormulaString('P'),
        notation: 'A'
      }
    ]
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument,
        rule: DERIVATION_RULES.find(r => r.type === 'CP')
      },
      data: () => ({ formulaString: 'P>P' })
    })
    const cpStep = {
      dependencies: [],
      line: 2,
      formula: parseFormulaString('P>P'),
      notation: '1,1 CP'
    }
    wrapper.find('input#antecedent').setValue(1)
    wrapper.find('input#consequent').setValue(1)
    wrapper.vm.commit()
    expect(wrapper.emitted('commit')[0]).toEqual([cpStep])
  })

  it('emits DE step', () => {
    const argument = [
      {
        dependencies: [1],
        line: 1,
        formula: parseFormulaString('PvQ'),
        notation: 'A'
      },
      {
        dependencies: [2],
        line: 2,
        formula: parseFormulaString('P'),
        notation: 'A'
      },
      {
        dependencies: [2],
        line: 3,
        formula: parseFormulaString('QvP'),
        notation: '2 DI'
      },
      {
        dependencies: [4],
        line: 4,
        formula: parseFormulaString('Q'),
        notation: 'A'
      },
      {
        dependencies: [4],
        line: 5,
        formula: parseFormulaString('QvP'),
        notation: '4 DI'
      }
    ]
    const wrapper = shallowMount(StepMaker, {
      propsData: {
        argument,
        rule: DERIVATION_RULES.find(r => r.type === 'DE')
      },
      data: () => ({ formulaString: 'QvP' })
    })
    const deStep = {
      dependencies: [1],
      line: 6,
      formula: parseFormulaString('QvP'),
      notation: '1,2,3,4,5 DE'
    }
    wrapper.find('input#disjunction').setValue(1)
    wrapper.find('input#leftAssumption').setValue(2)
    wrapper.find('input#leftConclusion').setValue(3)
    wrapper.find('input#rightAssumption').setValue(4)
    wrapper.find('input#rightConclusion').setValue(5)
    wrapper.vm.commit()
    expect(wrapper.emitted('commit')[0]).toEqual([deStep])
  })
})
