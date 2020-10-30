import { shallowMount } from '@vue/test-utils'
import ArgumentBuilder from '@/components/ArgumentBuilder.vue'
import AssertionHeader from '@/components/AssertionHeader.vue'
import ArgumentStep from '@/components/ArgumentStep.vue'
import { parseFormulaString } from '@/models/formulaParser.js'

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

  it('conditionally renders submit button', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: [],
        hasSubmitted: false
      })
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBeTruthy()
    expect(button.text()).toBe('Submit Argument')
  })

  it('conditionally does not render submit button', () => {
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: [],
        hasSubmitted: true
      })
    })
    expect(wrapper.find('button').exists()).toBeFalsy()
  })

  it('triggers submitArgument on button click', () => {
    const submitArgument = jest.spyOn(ArgumentBuilder.methods, 'submitArgument')
    const wrapper = shallowMount(ArgumentBuilder, {
      data: () => ({
        argument: simpleArgument,
        hasSubmitted: false
      })
    })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(submitArgument).toBeCalled()
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
