import { createStore } from 'vuex'
import D3Mixin from '@/hooks/D3Mixin'
let { FullScreen } = D3Mixin()

const store = createStore ({
  state: {
    isFullScreen: false,
    currentNode: null
  },
  mutations: {
    toggleFullScreen(state) {
      FullScreen(state.isFullScreen);
      state.isFullScreen = !state.isFullScreen;
    },
    setCurrentNode(state, node) {
      state.currentNode = node
    }
  },
  actions: {
  },
  modules: {}
})

export default store