import assert from 'assert'
// import Vue from 'vue'
import Risk3sixty from '@/components/Risk3sixty.vue'

// Here are some Jasmine 2.0 tests, though you can
// use any test runner / assertion library combo you prefer
describe('Risk3sixty', function() {
  // Inspect the raw component options
  it('has a created hook', function() {
    assert.equal('function', typeof Risk3sixty.created)
  })

  // Evaluate the results of functions in
  // the raw component options
  it('sets the correct default data', () => {
    assert.equal('function', typeof Risk3sixty.data)
    const defaultData = Risk3sixty.data()
    assert.equal(0, defaultData.stickyNotesBoard.notes.length)
  })
  
  // Inspect the component instance on mount
  // it('correctly sets the message when created', () => {
  //   const vm = new Vue(Risk3sixty).$mount()
  //   expect(vm.message).toBe('bye!')
  // })
  
  // Mount an instance and inspect the render output
  // it('renders the correct message', () => {
  //   const Constructor = Vue.extend(Risk3sixty)
  //   const vm = new Constructor().$mount()
  //   expect(vm.$el.textContent).toBe('bye!')
  // })
})
