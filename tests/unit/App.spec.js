import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'
import { constructAssertion, parseFormulaString } from '@/models/formulaParser.js'
import AssertionCreator from '@/components/AssertionCreator.vue'
import ArgumentBuilder from '@/components/ArgumentBuilder.vue'

const validAssumptionP = [
  {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }
]

describe('App.vue', () => {
  it('renders root element #app', () => {
    const wrapper = shallowMount(App)
    const root = wrapper.element
    expect(root.id).toBe('app')
  })

  it('conditionally renders AssertionCreator component when assertion is null', () => {
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: null
      })
    })
    expect(wrapper.findComponent(AssertionCreator).exists()).toBeTruthy()
    expect(wrapper.findComponent(ArgumentBuilder).exists()).toBeFalsy()
  })

  it('calls declareAssertion on AssertionCreator declare event', async () => {
    const declareAssertion = jest.spyOn(App.methods, 'declareAssertion')
    const assertion = constructAssertion(['P'], 'P')
    const wrapper = shallowMount(App)
    await wrapper.vm.$nextTick() // allow ArgumentBuilder to generate Vue instance
    wrapper.findComponent(AssertionCreator).vm.$emit('declare', assertion)
    expect(declareAssertion).toBeCalledWith(assertion)
  })

  it('conditionally renders ArgumentBuilder component when assertion has been declared', () => {
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion(['P'], 'P')
      })
    })
    expect(wrapper.findComponent(AssertionCreator).exists()).toBeFalsy()
    expect(wrapper.findComponent(ArgumentBuilder).exists()).toBeTruthy()
  })

  it('calls validateArgument on ArgumentBuilder validate event', async () => {
    const validateArgument = jest.spyOn(App.methods, 'validateArgument')
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion(['P'], 'P')
      })
    })
    await wrapper.vm.$nextTick() // allow ArgumentBuilder to generate Vue instance
    wrapper.findComponent(ArgumentBuilder).vm.$emit('validate', validAssumptionP)
    expect(validateArgument).toBeCalledWith(validAssumptionP)
  })

  it('conditionally does not render congratulations message', async () => {
    const wrapper = shallowMount(App, {
      data: () => ({ proofValidated: false })
    })
    expect(wrapper.find('.congratulations').exists()).toBeFalsy()
  })

  it('conditionally renders invalid message', async () => {
    const wrapper = shallowMount(App, {
      data: () => ({ argumentGiven: true, proofValidated: false })
    })
    expect(wrapper.find('.invalid').exists()).toBeTruthy()
    expect(wrapper.find('.congratulations').exists()).toBeFalsy()
  })

  it('conditionally renders congratulations message', async () => {
    const wrapper = shallowMount(App, {
      data: () => ({ argumentGiven: true, proofValidated: true })
    })
    expect(wrapper.find('.congratulations').exists()).toBeTruthy()
    expect(wrapper.find('.invalid').exists()).toBeFalsy()
  })
})

describe('computed: assertionDelcared', () => {
  it('assertion === null: returns false', () => {
    const localThis = { assertion: null }
    expect(App.computed.assertionDelcared.call(localThis)).toBeFalsy()
  })

  it('assertion !== null: returns true', () => {
    const localThis = { assertion: constructAssertion(['P>Q', 'P'], 'Q') }
    expect(App.computed.assertionDelcared.call(localThis)).toBeTruthy()
  })
})

describe('methods: declareAssertion', () => {
  it('sets assertion correctly', () => {
    const assertion = constructAssertion(['P'], 'P')
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: null
      })
    })
    wrapper.vm.declareAssertion(assertion)
    expect(wrapper.vm.$data.assertion).toEqual(assertion)
  })
})

describe('methods: validateArgument', () => {
  it('sets argumentGiven to true', () => {
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion([], 'R'),
        proofValidated: true
      })
    })
    wrapper.vm.validateArgument([])
    expect(wrapper.vm.$data.argumentGiven).toBeTruthy()
  })

  it('sets proofValidated to false for an invalid argument', () => {
    const invalidArgument = [
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
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion(['P>(P>Q)', 'P'], 'Q'),
        proofValidated: true
      })
    })
    wrapper.vm.validateArgument(invalidArgument)
    expect(wrapper.vm.$data.proofValidated).toBeFalsy()
  })

  it('sets proofValidated to false after catching an error from validateProof call', () => {
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion([], 'S'),
        proofValidated: true
      })
    })
    wrapper.vm.validateArgument([])
    expect(wrapper.vm.$data.proofValidated).toBeFalsy()
  })

  it('sets proofValidated to true for a valid argument', () => {
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion(['P'], 'P'),
        proofValidated: false
      })
    })
    wrapper.vm.validateArgument(validAssumptionP)
    expect(wrapper.vm.$data.proofValidated).toBeTruthy()
  })
})
