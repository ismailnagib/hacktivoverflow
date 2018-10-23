import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    signedIn: false,
    authUser: null
  },
  mutations: {
    mutateSignedIn (state, value) {
      state.signedIn = value
    },
    mutateAuthUser (state, value) {
      state.authUser = value
    }
  },
  actions: {

  }
})
