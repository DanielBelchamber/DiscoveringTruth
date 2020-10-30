import { shallowMount } from '@vue/test-utils'
import AssertionHeader from '@/components/AssertionHeader.vue'
import FormulaSpan from '@/components/FormulaSpan.vue'
import { constructAssertion } from '@/models/formulaParser.js'

describe('AssertionHeader.vue', () => {
  it('renders FormulaSpan component', () => {
    const wrapper = shallowMount(AssertionHeader, {
      propsData: { assertion: constructAssertion([], 'Qv-Q') }
    })
    expect(wrapper.findComponent(FormulaSpan).exists()).toBeTruthy()
  })

  it('renders conclusion without assumptions', () => {
    const wrapper = shallowMount(AssertionHeader, {
      propsData: { assertion: constructAssertion([], 'Qv-Q') }
    })
    const formulaSpanList = wrapper.findAllComponents(FormulaSpan)
    expect(formulaSpanList.length).toBe(1)
    expect(formulaSpanList.at(0).classes()).toContain('conclusion')
  })

  it('renders two assumptions and a conclusion', () => {
    const wrapper = shallowMount(AssertionHeader, {
      propsData: { assertion: constructAssertion(['P>Q', 'P'], 'Q') }
    })
    const formulaSpanList = wrapper.findAllComponents(FormulaSpan)
    expect(formulaSpanList.length).toBe(3)
    expect(formulaSpanList.at(0).classes()).toContain('assumption')
    expect(formulaSpanList.at(1).classes()).toContain('assumption')
    expect(formulaSpanList.at(2).classes()).toContain('conclusion')
  })

  it('calls isLastAssumption once for each assumption on render', () => {
    const isLastAssumption = jest.spyOn(AssertionHeader.methods, 'isLastAssumption')
    shallowMount(AssertionHeader, {
      propsData: { assertion: constructAssertion(['P>Q', 'P'], 'Q') }
    })
    expect(isLastAssumption).toBeCalledTimes(2)
  })
})

describe('computed: assertHtml', () => {
  it('assumptions.length >= 1: returns the assert symbol with double spaces before and after', () => {
    const space = '&nbsp;'
    const assert = '\u22A6'
    const assertHtml = `${space}${space}${assert}${space}${space}`
    const localThis = { assertion: constructAssertion(['P>Q', 'P'], 'Q') }
    expect(AssertionHeader.computed.assertHtml.call(localThis)).toBe(assertHtml)
  })

  it('assumptions.length === 0: returns the assert symbol with double spaces after', () => {
    const space = '&nbsp;'
    const assert = '\u22A6'
    const assertHtml = `${assert}${space}${space}`
    const localThis = { assertion: constructAssertion([], 'Q') }
    expect(AssertionHeader.computed.assertHtml.call(localThis)).toBe(assertHtml)
  })
})

describe('methods: isLastAssumption', () => {
  it('works as intended', () => {
    const wrapper = shallowMount(AssertionHeader, {
      propsData: { assertion: constructAssertion(['P>Q', 'P'], 'Q') }
    })
    expect(wrapper.vm.isLastAssumption(0)).toBeFalsy()
    expect(wrapper.vm.isLastAssumption(1)).toBeTruthy()
  })
})
