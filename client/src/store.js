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
    menuIndex: 0,
    starred: []
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
    },
    mutateStarred (state, value) {
      state.starred = value
    }
  },
  actions: {
    getQuestions (context) {
      axios({
        url: 'https://hackerflow-server.ismailnagib.xyz/questions'
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
        url: 'https://hackerflow-server.ismailnagib.xyz/questions/self',
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
        url: `https://hackerflow-server.ismailnagib.xyz/questions/search?keyword=${keyword}`
      })
        .then(data => {
          context.commit('mutateQuestions', data.data.data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    getStarred (context, shouldDisplay) {
      axios({
        url: 'https://hackerflow-server.ismailnagib.xyz/users/starred',
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(data => {
          context.commit('mutateStarred', data.data.starred)
          if (shouldDisplay) {
            context.commit('mutateQuestions', data.data.detail)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
})
