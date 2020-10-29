import { shallowMount } from '@vue/test-utils'
import ArgumentStep from '@/components/ArgumentStep.vue'
import FormulaSpan from '@/components/FormulaSpan.vue'
import { parseFormulaString } from '@/models/formulaParser.js'

describe('ArgumentStep.vue', () => {
  const step = {
    dependencies: [1, 2],
    line: 3,
    formula: parseFormulaString('P>Q'),
    notation: '1,2 MPP'
  }

  it('renders FormulaSpan component', () => {
    const wrapper = shallowMount(ArgumentStep, {
      propsData: { step }
    })
    expect(wrapper.findComponent(FormulaSpan).exists()).toBeTruthy()
  })

  it('renders step properties', () => {
    const wrapper = shallowMount(ArgumentStep, {
      propsData: { step }
    })
    expect(wrapper.find('.dependencies').text()).toBe('1,2')
    expect(wrapper.find('.line').text()).toBe('(3)')
    const span = wrapper.findComponent(FormulaSpan)
    expect(span.element.parentElement.className).toContain('formula')
    expect(span.props('formula')).toEqual(step.formula)
    expect(wrapper.find('.notation').text()).toBe('1,2 MPP')
  })
})
