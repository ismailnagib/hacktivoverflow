<template>
  <div id='questionlist'>
    <button id='searchBtn' disabled><i class="fas fa-search"></i></button>
    <input id='searchInput' placeholder='Search' onfocus="this.placeholder = ''" onblur="this.placeholder = 'Search'" @keyup='search' v-model='keyword'>
    <button id='addBtn' v-if='signedin' @click='addModal'>+ New Question</button>
    <div id='menu' class="border-bottom mb-4 pb-4">
      <div id='menuLink' class="border-bottom pb-2 text-center">
        <button v-if='keyword.length === 0 && menuIndex === 1 && signedin' class="mr-2" @click='menuChange(0)' title="All Questions"><i class="fas fa-caret-left"></i></button>
        <button v-else-if='keyword.length === 0 && signedin' disabled class="mr-2" @click='menuChange(0)'><i class="fas fa-caret-left"></i></button>
        <router-link to='/' v-if='keyword.length === 0'>{{ menu[menuIndex] }}</router-link>
        <button v-if='keyword.length === 0 && menuIndex === 0 && signedin' class="ml-2" @click='menuChange(1)' title="My Questions"><i class="fas fa-caret-right"></i></button>
        <button v-else-if='keyword.length === 0 && signedin' disabled class="ml-2" @click='menuChange(1)'><i class="fas fa-caret-right"></i></button>
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
      <h6>You can upload an image here if you want to (<b>max. 3 MB</b>)</h6>
      <input type="file" accept="image/png, image/jpeg" @change='imgChange' style='width: auto; font-size: 14px; border: 2px solid #42b983'><br>
      <input type="text" v-model='title' placeholder="Title"><br>
      <wysiwyg v-model='content' style="height: 200px; overflow: auto" class="text-left"></wysiwyg><br>
      <div class='userloc border-top border-bottom'>
        <div v-if='!shareLoc'>
          <h6 v-if='detectedLoc'>We've detected that you're writing this from</h6>
          <h6 v-else class="placeholder">placeholder</h6>
          <input class="my-1" id='userLocInput' v-model='userLoc' @keyup='detectedLoc = false' :style="{ width: ((userLoc.length + 1) * 30) + 'px', 'max-width': '80%' }"><br>
          <div style="font-size: 12px">( <b>Hint:</b> You can change the location manually )</div><br>
          <button id='userLocBtn' v-on:click='shareLocToggle()'>Share that as my location in the question</button>
        </div>
        <div v-else>
          <i class="fas fa-check-circle"></i>
          <h4 class="mt-3 mb-2">{{ userLoc }}</h4>
          <h6 class="mb-3">will be shared as your location in the question</h6>
          <button id='userLocBtn' v-on:click='shareLocToggle()'>Cancel location sharing</button>
        </div>
      </div>
      <br>
      <div v-if='notice.length > 0' style='color: #42b983'>{{ notice }}</div>
      <div v-else class="placeholder">placeholder</div>
      <button @click='addModal'>Maybe Later</button>
      <button @click='addQuestion'>+ Add Question</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'questionlist',
  props: ['signedin', 'reload'],
  data () {
    return {
      questions: [],
      openListBackdrop: false,
      openAddModal: false,
      title: '',
      content: '',
      image: '',
      notice: '',
      keyword: '',
      savedUrl: '',
      isSearching: false,
      userLoc: '',
      detectedLoc: false,
      shareLoc: false,
      menu: ['All Questions', 'My Questions'],
      menuIndex: 0
    }
  },
  methods: {
    getQuestions () {
      axios({
        url: 'http://localhost:3000/articles'
      })
        .then(data => {
          this.questions = data.data.data
          this.$emit('questions', data.data.data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    getMyQuestions () {
      axios({
        url: 'http://localhost:3000/articles/self',
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(data => {
          this.questions = data.data.data
          this.$emit('questions', data.data.data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    menuChange (index) {
      this.menuIndex = index
    },
    addModal () {
      if (!this.openAddModal) {
        this.detectLoc()
      }
      this.openAddModal = !this.openAddModal
      this.openListBackdrop = !this.openListBackdrop
      this.notice = ''
    },
    addQuestion () {
      let loc = ''
      if (this.shareLoc) {
        loc = this.userLoc
      }

      if (this.image !== '') {
        let formData = new FormData()
        formData.append('image', this.image)

        axios({
          url: 'http://localhost:3000/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            token: localStorage.getItem('token')
          }
        })
          .then(image => {
            axios({
              url: 'http://localhost:3000/articles',
              method: 'post',
              headers: {
                token: localStorage.getItem('token')
              },
              data: {
                title: this.title,
                content: this.content,
                loc: loc,
                image: image.data.link
              }
            })
              .then(() => {
                this.addModal()
                this.getQuestions()
                this.title = ''
                this.content = ''
                this.image = ''
              })
              .catch(err => {
                this.notice = err.response.data.message
              })
          })
          // eslint-disable-next-line
          .catch(err => {
            this.notice = 'Sorry, but the image file is too large'
          })
      } else {
        axios({
          url: 'http://localhost:3000/articles',
          method: 'post',
          headers: {
            token: localStorage.getItem('token')
          },
          data: {
            title: this.title,
            content: this.content,
            loc: loc
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
      }
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
        axios({
          url: `http://localhost:3000/articles/search?keyword=${this.keyword}`
        })
          .then(data => {
            this.questions = data.data.data
            this.$emit('questions', data.data.data)
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    shareLocToggle () {
      this.shareLoc = !this.shareLoc
    },
    detectLoc () {
      axios({
        url: 'https://api.ipgeolocation.io/ipgeo?apiKey=09a9b19f92b24659af94da487a5ae169'
      })
        .then(data => {
          this.userLoc = `${data.data.state_prov}, ${data.data.country_name}`
          this.detectedLoc = true
        })
        .catch(err => {
          console.log(err)
        })
    },
    imgChange (event) {
      this.image = event.target.files[0]
    }
  },
  watch: {
    reload () {
      if (this.reload) {
        this.getQuestions()
      }
    },
    menuIndex () {
      this.$router.push('/')
      if (this.menuIndex === 0) {
        this.getQuestions()
      } else {
        this.getMyQuestions()
      }
    }
  },
  created () {
    this.getQuestions()
  }
}
</script>

<style>

</style>
