<template>
  <div id='questionlist'>
    <button id='searchBtn' disabled><i class="fas fa-search"></i></button>
    <input id='searchInput' placeholder='Search' onfocus="this.placeholder = ''" onblur="this.placeholder = 'Search'" @keyup='search' v-model='keyword'>
    <button id='addBtn' v-if='signedIn' @click='addModal'>+ New Question</button>
    <div id='menu' class="border-bottom mb-4 pb-4">
      <div id='menuLink' class="border-bottom pb-2 text-center">
        <button v-if='keyword.length === 0 && menuIndex === 1 && signedIn' class="mr-2" @click='menuChange(0)' title="All Questions"><i class="fas fa-caret-left"></i></button>
        <button v-else-if='keyword.length === 0 && signedIn' disabled class="mr-2"><i class="fas fa-caret-left"></i></button>
        <router-link to='/' v-if='keyword.length === 0'>{{ menu[menuIndex] }}</router-link>
        <button v-if='keyword.length === 0 && menuIndex === 0 && signedIn' class="ml-2" @click='menuChange(1)' title="My Questions"><i class="fas fa-caret-right"></i></button>
        <button v-else-if='keyword.length === 0 && signedIn' disabled class="ml-2"><i class="fas fa-caret-right"></i></button>
        <div v-if='keyword.length !== 0'>Search Result</div>
      </div><br>
      <div id="questionLink" >
        <router-link :to='{name: "detail", params: {id: question._id}}' v-for='(question, index) in questions' :key='index'>{{ question.title }}<br></router-link>
      </div>
      <div v-if='questions.length > 5'><b>( Scroll down for more )</b></div>
    </div>
    <div id='listBackdrop' v-if='openListBackdrop'></div>
    <!-- ADD MODAL -->
    <div id='addModal' v-if='openAddModal'>
      <button @click='addModal' class="float-right" style="margin: -25px -25px 0 0; padding: 0; border: 0; background: transparent; color: #42b983"><i class="far fa-times-circle"></i></button>
      <input type="text" v-model='title' placeholder="Title"><br>
      <wysiwyg v-model='content' style="height: 200px; overflow: auto" class="text-left"></wysiwyg><br>
      <div v-if='notice.length > 0' style='color: #42b983'>{{ notice }}</div>
      <div v-else class="placeholder">placeholder</div>
      <button @click='addModal'>Maybe Later</button>
      <button @click='addQuestion'>+ Add Question</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import store from '@/store'
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  name: 'questionlist',
  store,
  data () {
    return {
      openListBackdrop: false,
      openAddModal: false,
      title: '',
      content: '',
      notice: '',
      keyword: '',
      savedUrl: '',
      isSearching: false,
      menu: ['All Questions', 'My Questions'],
    }
  },
  methods: {
    ...mapActions(['getQuestions', 'getMyQuestions', 'searchAction']),
    ...mapMutations(['mutateMenuIndex']),
    menuChange (index) {
      this.mutateMenuIndex(index)
    },
    addModal () {
      this.openAddModal = !this.openAddModal
      this.openListBackdrop = !this.openListBackdrop
      this.notice = ''
    },
    addQuestion () {
      axios({
        url: 'http://localhost:3000/questions',
        method: 'post',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          title: this.title,
          content: this.content
        }
      })
        .then(() => {
          this.addModal()
          this.getQuestions()
          this.title = ''
          this.content = ''
        })
        .catch(err => {
          this.notice = err.response.data.message
        })
    },
    search () {
      if (this.keyword.length === 1) {
        if (this.$route.params.id && !this.isSearching) {
          this.savedUrl = this.$route.params.id
        } else if (!this.isSearching) {
          this.savedUrl = ''
        }
        if (!this.isSearching) {
          this.isSearching = true
        }
        this.$router.push('/')
      }
      if (this.keyword.length === 0) {
        if (!this.$route.params.id) {
          this.$router.push(`/${this.savedUrl}`)
        }
        this.isSearching = false
        if (this.menuIndex === 0) {
          this.getQuestions()
        } else {
          this.getMyQuestions()
        }
      } else {
        this.searchAction(this.keyword)
      }
    }
  },
  watch: {
    menuIndex () {
      if (this.menuIndex === 0) {
        this.getQuestions()
      } else {
        this.getMyQuestions()
      }
    }
  },
  created () {
    this.getQuestions()
  },
  computed: {
    ...mapState(['signedIn', 'questions', 'menuIndex']),
  }
}
</script>

<style>

</style>
