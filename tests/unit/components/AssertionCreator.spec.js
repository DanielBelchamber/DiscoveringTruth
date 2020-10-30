import { shallowMount } from '@vue/test-utils'
import AssertionCreator from '@/components/AssertionCreator.vue'
import AssertionHeader from '@/components/AssertionHeader.vue'
import { constructAssertion } from '@/models/formulaParser.js'

describe('AssertionCreator.vue', () => {
  it('renders AssertionHeader component', () => {
    const wrapper = shallowMount(AssertionCreator, {
      data: () => ({
        assertion: constructAssertion([], 'Qv-Q')
      })
    })
    expect(wrapper.findComponent(AssertionHeader).exists()).toBeTruthy()
  })
})
