import { shallowMount } from '@vue/test-utils'
import AssertionCreator from '@/components/AssertionCreator.vue'
import AssertionHeader from '@/components/AssertionHeader.vue'
import { constructAssertion } from '@/models/formulaParser.js'

describe('AssertionCreator.vue', () => {
  it('renders AssertionHeader component', () => {
    const wrapper = shallowMount(AssertionCreator)
    expect(wrapper.findComponent(AssertionHeader).exists()).toBeTruthy()
  })

  it('conditionally does not render assumptions', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ assumptionStringList: [] })
    })
    expect(wrapper.find('p.assumption').exists()).toBeFalsy()
  })

  it('conditionally renders assumptions', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ assumptionStringList: ['', '-Q'] })
    })
    // p.assumption
    const assumptions = wrapper.findAll('p.assumption')
    expect(assumptions.length).toBe(2)
    // Assuption 1
    const assumption1 = assumptions.at(0)
    expect(assumption1.element.children.length).toBe(3)
    const label1 = assumption1.find('label')
    expect(label1.text()).toBe('Assumption 1:')
    expect(label1.attributes('for')).toBe('assumption-0')
    const input1 = assumption1.find('input#assumption-0')
    expect(input1.attributes('type')).toBe('text')
    expect(input1.element.value).toBe('')
    const span1 = assumption1.find('span.remove')
    expect(span1.text()).toBe('\u00D7')
    // Assuption 2
    const assumption2 = assumptions.at(1)
    expect(assumption2.element.children.length).toBe(3)
    const label2 = assumption2.find('label')
    expect(label2.text()).toBe('Assumption 2:')
    expect(label2.attributes('for')).toBe('assumption-1')
    const input2 = assumption2.find('input#assumption-1')
    expect(input2.attributes('type')).toBe('text')
    expect(input2.element.value).toBe('-Q')
    const span2 = assumption2.find('span.remove')
    expect(span2.text()).toBe('\u00D7')
  })

  it('updates assumptionStringList on assumption input', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ assumptionStringList: ['P', '-Q'] })
    })
    const input0 = wrapper.find('input#assumption-0')
    input0.setValue('R>S')
    expect(wrapper.vm.$data.assumptionStringList).toEqual(['R>S', '-Q'])
  })

  it('calls removeAssumption on span.remove click', () => {
    const removeAssumption = jest.spyOn(AssertionCreator.methods, 'removeAssumption')
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ assumptionStringList: ['P', '-Q', 'S>R'] })
    })
    wrapper.findAll('span.remove').at(1).trigger('click')
    expect(removeAssumption).toBeCalledWith(1)
  })

  it('renders conclusion input', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ conclusionString: 'P>Q' })
    })
    // p.conclusion
    const conclusion = wrapper.find('p.conclusion')
    expect(conclusion.exists()).toBeTruthy()
    expect(conclusion.element.children.length).toBe(2)
    // label
    const label = conclusion.find('label')
    expect(label.text()).toBe('Conclusion:')
    expect(label.attributes('for')).toBe('conclusion')
    // input#conclusion
    const input = conclusion.find('input#conclusion')
    expect(input.attributes('type')).toBe('text')
    expect(input.element.value).toBe('P>Q')
  })

  it('updates conclusionString on conclusion input', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ conclusionString: 'P>Q' })
    })
    wrapper.find('input#conclusion').setValue('Pv-P')
    expect(wrapper.vm.$data.conclusionString).toEqual('Pv-P')
  })

  it('renders button and submit input', () => {
    const wrapper = shallowMount(AssertionCreator)
    const button = wrapper.find('button')
    expect(button.exists()).toBeTruthy()
    expect(button.text()).toBe('Add Assumption')
    const submit = wrapper.find('input[type=submit]')
    expect(submit.exists()).toBeTruthy()
    expect(submit.element.value).toBe('Declare Assertion')
  })

  it('calls addAssumption on button click', () => {
    const addAssumption = jest.spyOn(AssertionCreator.methods, 'addAssumption')
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ assumptionStringList: ['P', '-Q', 'S>R'] })
    })
    wrapper.findAll('button').at(0).trigger('click')
    expect(addAssumption).toBeCalled()
  })

  it('calls declareAssertion on form submit', async () => {
    const declareAssertion = jest.spyOn(AssertionCreator.methods, 'declareAssertion')
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ conclusionString: 'P&Q' })
    })
    await wrapper.find('form').trigger('submit.prevent')
    expect(declareAssertion).toBeCalled()
  })
})

describe('computed: assertion', () => {
  it('returns the intended assertion object', () => {
    const localThis = {
      assumptionStringList: ['P', 'R>Q'],
      conclusionString: 'S'
    }
    const assertion = constructAssertion(['P', 'R>Q'], 'S')
    const computed = AssertionCreator.computed.assertion.call(localThis)
    expect(computed.assumptionList[0].string).toEqual(assertion.assumptionList[0].string)
    expect(computed.assumptionList[1].string).toEqual(assertion.assumptionList[1].string)
    expect(computed.conclusion.string).toEqual(assertion.conclusion.string)
  })

  it('returns a skeleton object after catching a parsing error', () => {
    const skeleton = {
      assumptionList: [],
      conclusion: null
    }
    const localThis = {
      assumptionStringList: ['P', 'R>Q'],
      conclusionString: ''
    }
    expect(AssertionCreator.computed.assertion.call(localThis)).toEqual(skeleton)
  })
})

describe('computed: hasConclusion', () => {
  it('returns true when assertion conclusion is a well-formed formula', async () => {
    const localThis = { assertion: constructAssertion(['P', 'Q'], 'P>(P>Q)') }
    expect(AssertionCreator.computed.hasConclusion.call(localThis)).toBeTruthy()
  })

  it('returns false when assertion conclusion is null', () => {
    const localThis = {
      assertion: {
        assumptionList: [],
        conclusion: null
      }
    }
    expect(AssertionCreator.computed.hasConclusion.call(localThis)).toBeFalsy()
  })
})

describe('methods: getAssumptionID', () => {
  it('returns an id string', () => {
    const wrapper = shallowMount(AssertionCreator)
    expect(wrapper.vm.getAssumptionID(2)).toBe('assumption-2')
  })
})

describe('methods: getAssumptionLabel', () => {
  it('returns a helpul label', () => {
    const wrapper = shallowMount(AssertionCreator)
    expect(wrapper.vm.getAssumptionLabel(2)).toBe('Assumption 3:')
  })
})

describe('methods: addAssumption', () => {
  it('adds a new blank assumption to the end of assumptionStringList', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ assumptionStringList: ['P&Q', 'R>Qv-P'] })
    })
    wrapper.vm.addAssumption()
    expect(wrapper.vm.$data.assumptionStringList).toEqual(['P&Q', 'R>Qv-P', ''])
  })
})

describe('methods: removeAssumption', () => {
  it('removes the correct assumption', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ assumptionStringList: ['P&Q', 'R>Qv-P', 'R'] })
    })
    wrapper.vm.removeAssumption(1)
    expect(wrapper.vm.$data.assumptionStringList).toEqual(['P&Q', 'R'])
  })
})

describe('methods: declareAssertion', () => {
  it('emits the declare event with the full assertion object', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({
        assumptionStringList: ['P>Q', 'P'],
        conclusionString: 'Q'
      })
    })
    const assertion = constructAssertion(['P>Q', 'P'], 'Q')
    wrapper.vm.declareAssertion()
    expect(wrapper.emitted('declare')[0]).toEqual([assertion])
  })

  it('does not emit the declare event when assertion calculation throws an error', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({ conclusionString: 'P>' })
    })
    wrapper.vm.declareAssertion()
    expect(wrapper.emitted('declare')).toBeFalsy()
  })
})
