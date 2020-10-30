import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'
import { constructAssertion, parseFormulaString } from '@/models/formulaParser.js'
import ArgumentBuilder from '@/components/ArgumentBuilder.vue'

const validAssumptionP = [
  {
    dependencies: [1],
    line: 1,
    formula: parseFormulaString('P'),
    notation: 'A'
  }
]

const invalidAssumptionQ = [
  {
    dependencies: [],
    line: 1,
    formula: parseFormulaString('Q'),
    notation: 'A'
  }
]

describe('App.vue', () => {
  it('renders root element #app', () => {
    const wrapper = shallowMount(App)
    const root = wrapper.element
    expect(root.id).toBe('app')
  })

  it('renders ArgumentBuilder component', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.findComponent(ArgumentBuilder).exists()).toBeTruthy()
  })

  it('calls validateArgument on ArgumentBuilder sumbit event', async () => {
    const validateArgument = jest.spyOn(App.methods, 'validateArgument')
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion(['P'], 'P')
      })
    })
    await wrapper.vm.$nextTick() // allow ArgumentBuilder to generate Vue instance
    wrapper.findComponent(ArgumentBuilder).vm.$emit('submit', validAssumptionP)
    expect(validateArgument).toBeCalledWith(validAssumptionP)
  })

  it('conditionally does not render congratulations message', async () => {
    const wrapper = shallowMount(App, {
      data: () => ({ hasProof: false })
    })
    expect(wrapper.find('.congratulations').exists()).toBeFalsy()
  })

  it('conditionally renders congratulations message', async () => {
    const wrapper = shallowMount(App, {
      data: () => ({ hasProof: true })
    })
    expect(wrapper.find('.congratulations').exists()).toBeTruthy()
  })
})

describe('methods: validateArgument', () => {
  it('sets hasProof to false for an invalid argument', () => {
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion(['P>Q', 'P'], 'Q'),
        hasProof: true
      })
    })
    wrapper.vm.validateArgument(invalidAssumptionQ)
    expect(wrapper.vm.$data.hasProof).toBeFalsy()
  })

  it('sets hasProof to true for a valid argument', () => {
    const wrapper = shallowMount(App, {
      data: () => ({
        assertion: constructAssertion(['P'], 'P'),
        hasProof: false
      })
    })
    wrapper.vm.validateArgument(validAssumptionP)
    expect(wrapper.vm.$data.hasProof).toBeTruthy()
  })
})
