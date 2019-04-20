import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)


const store = new Vuex.Store({
  state: {
    token: localStorage.getItem('auth-token') || '',
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
  getters: {
    me: state => {
      const backwards = state.token.split("").reverse().join("")
      const [_, user] = backwards.split(".", 2)
      return JSON.parse(user.split("").reverse().join(""))
    }
  },
  actions: {
  }
})

export default store
