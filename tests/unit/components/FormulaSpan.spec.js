import { mount } from '@vue/test-utils'
import FormulaSpan from '@/components/FormulaSpan.vue'
import { parseFormulaString } from '@/models/formulaParser.js'
import { mapToHtml, mapToUnicode } from '@/models/symbolMapper.js'

describe('FormulaSpan.vue', () => {
  it('renders as a <span>', () => {
    const wrapper = mount(FormulaSpan, {
      propsData: { formula: parseFormulaString('P') }
    })
    const span = wrapper.element
    expect(span.tagName).toBe('span'.toUpperCase())
    expect(span.className).toBe('formula-span')
  })

  it('renders a blank span when given a null formula', () => {
    const wrapper = mount(FormulaSpan, {
      propsData: { formula: null }
    })
    expect(wrapper.text()).toBe('')
  })

  it('renders formula string with unicode characters', () => {
    const formulaString = 'Q&R>Pv-P'
    const unicodeString = mapToUnicode(formulaString)
    const wrapper = mount(FormulaSpan, {
      propsData: { formula: parseFormulaString(formulaString) }
    })
    expect(wrapper.text()).toBe(unicodeString)
  })

  it('renders correct unicode text', () => {
    const formulaString = 'Q&R>Pv-P'
    const unicodeString = mapToUnicode(formulaString)
    const wrapper = mount(FormulaSpan, {
      propsData: { formula: parseFormulaString(formulaString) }
    })
    expect(wrapper.text()).toBe(unicodeString)
  })
})

describe('computed: formulaHtml', () => {
  it('returns the html encoding for the given formula', () => {
    const formulaString = '(S>R)&-P'
    const htmlString = mapToHtml(formulaString)
    const localThis = { formula: parseFormulaString(formulaString) }
    expect(FormulaSpan.computed.formulaHtml.call(localThis)).toBe(htmlString)
  })
})
