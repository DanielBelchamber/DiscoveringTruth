import { shallowMount } from '@vue/test-utils'
import ArgumentBuilder from '@/components/ArgumentBuilder.vue'
import AssertionHeader from '@/components/AssertionHeader.vue'
import ArgumentStep from '@/components/ArgumentStep.vue'
import StepMaker from '@/components/StepMaker.vue'
import { parseFormulaString } from '@/models/formulaParser.js'
import { DERIVATION_RULES } from '@/models/proofValidator.js'

const simpleArgument = [
  {
    assumptions: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }
]

const mppArgument = [
  {
    assumptions: [1],
    line: 1,
    formula: parseFormulaString('P>Q'),
    notation: 'A'
  },
  {
    assumptions: [2],
    line: 2,
    formula: parseFormulaString('P'),
    notation: 'A'
  },
  {
    assumptions: [1, 2],
    line: 3,
    formula: parseFormulaString('Q'),
    notation: '1,2 MPP'
  }
]

describe('ArgumentBuilder.vue', () => {
  it('renders AssertionHeader & ArgumentStep components', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({ argument: simpleArgument })
    })
    expect(wrapper.findComponent(AssertionHeader).exists()).toBeTruthy()
    expect(wrapper.findComponent(ArgumentStep).exists()).toBeTruthy()
  })

  it('renders multiple steps', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({ argument: mppArgument })
    })
    expect(wrapper.findAllComponents(ArgumentStep).length).toBe(3)
  })

  it('conditionally renders rule select and Cancel button', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({ hasSubmitted: false, addingStep: true })
    })
    // select.rule
    const select = wrapper.find('select.rule')
    expect(select.exists()).toBeTruthy()
    const options = select.findAll('option')
    const defaultOption = options.at(0)
    expect(defaultOption.attributes('disabled')).toBeTruthy()
    expect(defaultOption.element.value).toBe('')
    expect(defaultOption.text()).toBe('Choose Derivation Rule')
    const aOption = options.at(1)
    expect(aOption.attributes('disabled')).toBeFalsy()
    expect(aOption.text()).toBe(DERIVATION_RULES[0].name)
    const mppOption = options.at(2)
    expect(mppOption.attributes('disabled')).toBeTruthy()
    expect(mppOption.text()).toBe(DERIVATION_RULES[1].name)
    // cancel button
    const cancelButton = wrapper.find('button')
    expect(cancelButton.exists()).toBeTruthy()
    expect(cancelButton.text()).toBe('Cancel')
  })

  it('calls isAssumptionOrNotFirst for each derivation rule', () => {
    const isAssumptionOrNotFirst = jest.spyOn(ArgumentBuilder.methods, 'isAssumptionOrNotFirst')
    shallowMount(ArgumentBuilder, {
      data: () => ({ hasSubmitted: false, addingStep: true })
    })
    expect(isAssumptionOrNotFirst).toBeCalledTimes(DERIVATION_RULES.length)
  })

  it('selecting dropdown updates rule', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        rule: null,
        hasSubmitted: false,
        addingStep: true
      })
    })
    const options = wrapper.findAll('select.rule option')
    options.at(1).setSelected()
    const selectedOption = wrapper.find('select.rule option:checked')
    expect(selectedOption.text()).toBe(DERIVATION_RULES[0].name)
  })

  it('triggers cancel on Cancel button click', () => {
    const cancel = jest.spyOn(ArgumentBuilder.methods, 'cancel')
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        hasSubmitted: false,
        addingStep: true
      })
    })
    wrapper.find('button').trigger('click')
    expect(cancel).toBeCalled()
  })

  it('conditionally renders StepMaker', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        rule: DERIVATION_RULES[0],
        hasSubmitted: false,
        addingStep: true
      })
    })
    expect(wrapper.findComponent(StepMaker).exists()).toBeTruthy()
  })

  it('calls commitStep on StepMaker commit event', () => {
    const commitStep = jest.spyOn(ArgumentBuilder.methods, 'commitStep')
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        rule: DERIVATION_RULES[0],
        hasSubmitted: false,
        addingStep: true
      })
    })
    const step = {
      dependencies: [1],
      line: 1,
      formula: parseFormulaString('P'),
      notation: 'A'
    }
    wrapper.findComponent(StepMaker).vm.$emit('commit', step)
    expect(commitStep).toBeCalledWith(step)
  })

  it('conditionally renders Add Step and Submit Argument buttons', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: [],
        hasSubmitted: false,
        addingStep: false
      })
    })
    const buttons = wrapper.findAll('button')
    const atButton = buttons.at(0)
    expect(atButton.exists()).toBeTruthy()
    expect(atButton.text()).toBe('Add Step')
    const submitButton = buttons.at(1)
    expect(submitButton.exists()).toBeTruthy()
    expect(submitButton.text()).toBe('Submit Argument')
  })

  it('conditionally does not render Add Step and Submit Argument buttons', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: [],
        hasSubmitted: true
      })
    })
    expect(wrapper.find('button').exists()).toBeFalsy()
  })

  it('triggers addStep on Add Step button click', () => {
    const addStep = jest.spyOn(ArgumentBuilder.methods, 'addStep')
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: simpleArgument,
        hasSubmitted: false
      })
    })
    const addButton = wrapper.findAll('button').at(0)
    addButton.trigger('click')
    expect(addStep).toBeCalled()
  })

  it('triggers submitArgument on Submit Argument button click', () => {
    const submitArgument = jest.spyOn(ArgumentBuilder.methods, 'submitArgument')
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: simpleArgument,
        hasSubmitted: false
      })
    })
    const submitButton = wrapper.findAll('button').at(1)
    submitButton.trigger('click')
    expect(submitArgument).toBeCalled()
  })
})

describe('methods: addStep', () => {
  it('sets addingStep to true', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        hasSubmitted: false,
        addingStep: false
      })
    })
    wrapper.vm.addStep()
    expect(wrapper.vm.$data.addingStep).toBeTruthy()
  })
})

describe('methods: isAssumptionOrNotFirst', () => {
  it('returns true for first assumption', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({ argument: [] })
    })
    expect(wrapper.vm.isAssumptionOrNotFirst('A')).toBeTruthy()
  })

  it('returns false for first non-assumption', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({ argument: [] })
    })
    expect(wrapper.vm.isAssumptionOrNotFirst('MPP')).toBeFalsy()
  })

  it('returns true for rule after first', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: [{
          dependencies: [1],
          line: 1,
          formula: parseFormulaString('P'),
          notation: 'A'
        }]
      })
    })
    expect(wrapper.vm.isAssumptionOrNotFirst('MPP')).toBeTruthy()
  })
})

describe('methods: cancel', () => {
  it('resets addingStep and rule', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        rule: DERIVATION_RULES[1],
        hasSubmitted: false,
        addingStep: true
      })
    })
    wrapper.vm.cancel()
    expect(wrapper.vm.$data.rule).toBe(null)
    expect(wrapper.vm.$data.addingStep).toBeFalsy()
  })
})

describe('methods: commitStep', () => {
  it('adds step to argument', () => {
    const step = {
      dependencies: [1],
      line: 1,
      formula: parseFormulaString('P'),
      notation: 'A'
    }
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: [],
        rule: DERIVATION_RULES[0],
        hasSubmitted: false,
        addingStep: true
      })
    })
    wrapper.vm.commitStep(step)
    expect(wrapper.vm.$data.argument).toEqual([step])
    expect(wrapper.vm.$data.rule).toBe(null)
    expect(wrapper.vm.$data.addingStep).toBeFalsy()
  })
})

describe('methods: submitArgument', () => {
  it('emits validate event with argument', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: simpleArgument,
        hasSubmitted: false
      })
    })
    wrapper.vm.submitArgument()
    expect(wrapper.emitted('validate')[0]).toEqual([simpleArgument])
  })

  it('sets hasSubmitted to true', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: simpleArgument,
        hasSubmitted: false
      })
    })
    wrapper.vm.submitArgument()
    expect(wrapper.vm.$data.hasSubmitted).toEqual(true)
  })
})
