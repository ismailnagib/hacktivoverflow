import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    signedIn: false,
    verified: false,
    authUser: null,
    questions: [],
    menuIndex: 0
  },
  mutations: {
    mutateSignedIn (state, value) {
      state.signedIn = value
    },
    mutateVerified (state, value) {
      state.verified = value
    },
    mutateAuthUser (state, value) {
      state.authUser = value
    },
    mutateQuestions (state, value) {
      state.questions = value
    },
    mutateMenuIndex (state, value) {
      state.menuIndex = value
    }
  },
  actions: {
    getQuestions (context) {
      axios({
        url: 'http://localhost:3000/questions'
      })
        .then(data => {
          context.commit('mutateQuestions', data.data.data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    getMyQuestions (context) {
      axios({
        url: 'http://localhost:3000/questions/self',
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(data => {
          context.commit('mutateQuestions', data.data.data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    searchAction (context, keyword) {
      axios({
        url: `http://localhost:3000/questions/search?keyword=${keyword}`
      })
        .then(data => {
          context.commit('mutateQuestions', data.data.data)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
})
