import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '',
    rooms: [],
  },
  mutations: {
    TOKEN_INSERTED(state, token) {
      state.token = token
    },
    TOKEN_DELETED(state) {
      state.token = ''
    },
  },
  actions: {
    SELECT_ROOM() {
      
    }
  }
})
