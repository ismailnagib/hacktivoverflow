<template>
  <div id='questionlarge'>
    <div v-if='showAll'>
      <div class="border mb-4" v-for='(question, index) in questions' :key='index'>
        <div v-if='question.author._id === authUser'>
          <div class="optBtn float-right">
            <button title="Edit Question" @click='editModal(question._id, question.title, question.content)'><i class="far fa-edit"></i></button>
            <button title="Delete Question" @click='deleteModal(question._id)'><i class="far fa-trash-alt"></i></button>
          </div>
        </div>
        <div v-else>
          <div class="optBtn"></div>
        </div>
        <router-link class="question" :to="{name: 'detail', params: {id: question._id}}">
          <div class="card-body pt-0" :class="{'mt-40': question.author._id === authUser }">
            <div class="row">
              <div class="col-2 border-right text-center question-vote">
                <div>
                  <h5><b>{{ question.vote }}</b></h5>
                  <h6><b>VOTE<span v-if='question.vote > 1'>S</span></b></h6>
                </div>
              </div>
              <div class="col-10 text-center question-title">
                <h5 class="card-title pb-2"><strong>{{ question.title }}</strong></h5>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <div v-else>
      <div v-if='detail.author._id === authUser'>
        <div class="optBtn float-right">
          <button title="Edit Question" @click='editModal(detail._id, detail.title, detail.content)'><i class="far fa-edit"></i></button>
          <button title="Delete Question" @click='deleteModal(detail._id)'><i class="far fa-trash-alt"></i></button>
        </div>
      </div>
      <div v-else>
        <div class="optBtn"></div>
      </div>
      <div class="card-body detail-body">
        <div class="row m-0" :class="{'mt-40': detail.author._id === authUser}">
          <div class="col-2 border-right text-center question-vote">
            <div>
              <span v-if='detail.author._id !== authUser && signedIn'><i class="fas fa-chevron-up" @click='qUpvote' :class="{voted: detail.upvote.indexOf(authUser) !== -1}"></i></span>
              <h5><b>{{ detail.vote }}</b></h5>
              <span v-if='detail.author._id !== authUser && signedIn'><i class="fas fa-chevron-down" @click='qDownvote' :class="{voted: detail.downvote.indexOf(authUser) !== -1}"></i></span>
              <h6 v-else><b>VOTE<span v-if='detail.vote > 1'>S</span></b></h6>
              <span v-if='detail.author._id !== authUser && signedIn'><br><i class="fas fa-star" @click='starToggle' :class="{voted: starred.indexOf(detail._id) !== -1}"></i></span>
            </div>
          </div>
          <div class="col-10 text-center question-title">
            <h4 class="card-title border-bottom mb-3 pb-2"><strong>{{ detail.title }}</strong></h4>
            <h6>by <b>{{ detail.author.name }}</b></h6><br>
          </div>
        </div>
        <div class="row mt-4">
          <p class="card-text" v-html='detail.content'></p>
        </div>
      </div>
      <div v-if="signedIn" class="text-left" id='answer'>
        <h5>Add your answers here . . .</h5>
        <wysiwyg class="text-left" style="height: 100px; overflow: auto" v-model='answer'></wysiwyg>
        <div class="text-center">
          <div v-if='answerNotice.length > 0' style='color: #42b983'>{{ answerNotice }}</div>
          <div v-else class="placeholder">placeholder</div>
          <button @click='addAnswer(detail._id)'>+ New Answer</button>
        </div>
      </div>
      <div class="answers border-top pt-4 mt-4">
        <div class="row pb-2 mb-4 border-bottom" v-for='(answer, index) in detail.answers' :key='index'>
          <div class="col-2 border-right text-center question-vote pr-0">
            <div>
              <span v-if='answer.answerer._id !== authUser && signedIn'><i class="fas fa-chevron-up" @click='aUpvote(answer._id)' :class="{voted: answer.upvote.indexOf(authUser) !== -1}"></i></span>
              <h5><b>{{ answer.vote }}</b></h5>
              <span v-if='answer.answerer._id !== authUser && signedIn'><i v-if='answer.answerer._id !== authUser' class="fas fa-chevron-down" @click='aDownvote(answer._id)' :class="{voted: answer.downvote.indexOf(authUser) !== -1}"></i></span>
              <h6 v-else><b>VOTE<span v-if='answer.vote > 1'>S</span></b></h6>
            </div>
          </div>
          <div class="col-9 text-justify">
            <div class="answerer">
              <b>{{ answer.answerer.name }}</b> answered on {{ answer.createdAt.slice(0, 10) }}
            </div>
            <h6 v-html="answer.words"></h6>
          </div>
          <div class="col-1" v-if='answer.answerer._id === authUser'>
            <button class='ansEditBtn' @click='editAnswerModal(answer.words, answer._id)'><i class="far fa-edit"></i></button>
            <button class='ansDelBtn' @click='deleteAnswerModal(answer._id)'><i class="far fa-trash-alt"></i></button>
          </div>
          <div class="col-1" v-else></div>
          <div v-if='signedIn' class="row col-12 mt-4 pr-0">
            <div class="col-11 mb-1 replies">
              <wysiwyg class='text-left' style="height: 100px; overflow: auto" placeholder="Reply to this answer"  onfocus='this.placeholder = ""' onblur='this.placeholder = "Reply to this answer"' v-model='reply[index]'></wysiwyg>
            </div>
            <div class="col-1 mb-1 replyBtn">
              <button @click='replyAnswer(answer._id, index)'><i class="fas fa-paper-plane"></i></button>
            </div>
            <div v-if='replyNotice[index].length > 0' class="col-12 mb-2" style='color: #42b983'>{{ replyNotice[index] }}</div>
            <div v-else class="placeholder col-12 mb-2">placeholder</div>
          </div>
          <div class="row col-12 m-0" v-for='(reply, index) in answer.answers' :key='index'>
            <div class="col-1"></div>
            <div class="col-10 text-justify border-top pt-3 pb-2">
              <div class="answerer">
                <b>{{ reply.answerer.name }}</b> replied on {{ reply.createdAt.slice(0, 10) }}
              </div>
              <h6 v-html="reply.words"></h6>
            </div>
            <div class="col-1 border-top pt-3 pb-2" v-if='reply.answerer._id === authUser'>
              <button class='ansDelBtn' @click='deleteAnswerModal(reply._id)'><i class="far fa-trash-alt"></i></button>
            </div>
            <div class="col-1 border-top pt-3 pb-2" v-else></div>
          </div>
        </div>
      </div>
    </div>
    <!-- MODALS -->
      <!-- BACKDROP -->
      <div id='optBackdrop' v-if='optBackdrop'></div>
      <!-- EDIT MODAL -->
      <div id='editModal' v-if='openEditModal'>
        <button @click='editModal' class="float-right" style="margin: -25px -25px 0 0; padding: 0; border: 0; background: transparent; color: #42b983"><i class="far fa-times-circle"></i></button>
        <input type="text" v-model='title' placeholder="Title"><br>
        <wysiwyg v-model='content' class="text-left" style="height: 300px; overflow: auto"></wysiwyg><br>
        <div v-if='notice.length > 0' style='color: #42b983'>{{ notice }}</div>
        <div v-else class="placeholder">placeholder</div>
        <button @click='editModal'>Argh, no, it's perfect!</button>
        <button @click='editQuestion'>Edit Question</button>
      </div>
      <!-- DELETE MODAL -->
      <div id='deleteModal' v-if='openDeleteModal'>
        <button @click='deleteModal' class="float-right" style="margin: -25px -25px 0 0; padding: 0; border: 0; background: transparent; color: #42b983"><i class="far fa-times-circle"></i></button>
        <h2>Are you sure<span>?</span></h2><br>
        <h5>The question will be permanently deleted after this</h5><br>
        <button @click='deleteModal'>No, sorry, that was a mistake</button>
        <button @click='deleteQuestion'>Yeah, get rid of this shit</button>
      </div>
      <!-- EDIT ANSWER MODAL -->
      <div id='editAnsModal' v-if='openEditAnsModal'>
        <button @click='editAnswerModal' class="float-right" style="margin: -25px -25px 0 0; padding: 0; border: 0; background: transparent; color: #42b983"><i class="far fa-times-circle"></i></button>
        <wysiwyg class="text-left" style="height: 100px; overflow: auto" v-model='answerEdit'></wysiwyg>
        <div v-if='editNotice.length > 0' style='color: #42b983'>{{ editNotice }}</div>
        <div v-else class="placeholder">placeholder</div>
        <button @click='editAnswerModal'>No, sorry, that was a mistake</button>
        <button @click='editAnswer'>Yeah, get rid of this shit</button>
      </div>
      <!-- DELETE ANSWER MODAL -->
      <div id='delAnsModal' v-if='openDelAnsModal'>
        <button @click='deleteAnswerModal' class="float-right" style="margin: -25px -25px 0 0; padding: 0; border: 0; background: transparent; color: #42b983"><i class="far fa-times-circle"></i></button>
        <h2>Are you sure<span>?</span></h2><br>
        <h5>The answer will be permanently deleted after this</h5><br>
        <button @click='deleteAnswerModal'>No, sorry, that was a mistake</button>
        <button @click='deleteAnswer'>Yeah, get rid of this shit</button>
      </div>
  </div>
</template>

<script>
import axios from 'axios'
import store from '@/store'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'questionlarge',
  store,
  data () {
    return {
      showAll: true,
      detail: {},
      title: '',
      content: '',
      notice: '',
      optBackdrop: false,
      openEditModal: false,
      openDeleteModal: false,
      editId: '',
      deleteId: '',
      answer: '',
      answerNotice: '',
      reply: [],
      replyNotice: [],
      openDelAnsModal: false,
      openEditAnsModal: false,
      delAnsId: '',
      editAnsId: '',
      answerEdit: '',
      editNotice: ''
    }
  },
  methods: {
    ...mapActions(['getQuestions', 'getMyQuestions', 'getStarred']),
    getDetail (id) {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/questions/${id}`
      })
        .then(data => {
          this.detail = data.data.data
          this.showAll = false
          this.reply = Array(data.data.data.answers.length).fill('')
          this.replyNotice = Array(data.data.data.answers.length).fill('')
        })
        .catch(err => {
          console.log(err)
        })
    },
    editModal (id, title, content) {
      this.openEditModal = !this.openEditModal
      this.optBackdrop = !this.optBackdrop
      if (id && title && content) {
        this.editId = id
        this.title = title
        this.content = content
      } else {
        this.editId = ''
        this.title = ''
        this.content = ''
      }
    },
    deleteModal (id) {
      this.openDeleteModal = !this.openDeleteModal
      this.optBackdrop = !this.optBackdrop
      if (id) {
        this.deleteId = id
      } else {
        this.deleteId = ''
      }
    },
    editQuestion () {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/questions/${this.editId}`,
        method: 'put',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          title: this.title,
          content: this.content
        }
      })
        .then(() => {
          this.editModal()
          if (this.menuIndex === 0) {
            this.getQuestions()
          } else {
            this.getMyQuestions()
          }
          if (this.$route.params.id) {
            this.getDetail(this.$route.params.id)
          }
        })
        .catch(err => {
          this.notice = err.response.data.message
        })
    },
    deleteQuestion () {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/questions/${this.deleteId}`,
        method: 'delete',
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(() => {
          this.deleteModal()
          if (this.menuIndex === 0) {
            this.getQuestions()
          } else {
            this.getMyQuestions()
          }
          this.$router.push('/')
        })
        .catch(err => {
          this.notice = err.response.data.message
        })
    },
    addAnswer (id) {
      axios({
        url: 'https://hackerflow-server.ismailnagib.xyz/answers',
        method: 'post',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          words: this.answer,
          questionId: id
        }
      })
        .then(() => {
          this.getDetail(this.$route.params.id)
          this.answer = ''
          this.answerNotice = ''
        })
        .catch(err => {
          this.answerNotice = err.response.data.message
          this.replyNotice = Array(this.replyNotice.length).fill('')
        })
    },
    replyAnswer (id, index) {
      axios({
        url: 'https://hackerflow-server.ismailnagib.xyz/answers/stack',
        method: 'post',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          words: this.reply[index],
          answerId: id
        }
      })
        .then(() => {
          this.getDetail(this.$route.params.id)
          this.reply.splice(index, 1, '')
          this.replyNotice.splice(index, 1, '')
        })
        .catch(err => {
          this.replyNotice = Array(this.replyNotice.length).fill('')
          this.replyNotice.splice(index, 1, err.response.data.message)
          this.answerNotice = ''
        })
    },
    deleteAnswerModal (id) {
      if (id) {
        this.delAnsId = id
      }
      this.optBackdrop = !this.optBackdrop
      this.openDelAnsModal = !this.openDelAnsModal
    },
    deleteAnswer () {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/answers/${this.delAnsId}`,
        method: 'delete',
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(data => {
          this.deleteAnswerModal()
          this.getDetail(this.$route.params.id)
        })
        .catch(err => {
          console.log(err)
        })
    },
    editAnswerModal (words, id) {
      if (words && id) {
        this.answerEdit = words
        this.editAnsId = id
      }
      this.optBackdrop = !this.optBackdrop
      this.openEditAnsModal = !this.openEditAnsModal
    },
    editAnswer () {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/answers/${this.editAnsId}`,
        method: 'put',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          words: this.answerEdit
        }
      })
        .then(() => {
          this.editAnswerModal()
          this.getDetail(this.$route.params.id)
        })
        .catch(err => {
          this.editNotice = err.response.data.message
        })
    },
    qUpvote () {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/questions/upvote`,
        method: 'patch',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          id: this.detail._id
        }
      })
        .then(() => {
          this.getDetail(this.detail._id)
        })
        .catch(err => {
          console.log(err)
        })
    },
    qDownvote () {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/questions/downvote`,
        method: 'patch',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          id: this.detail._id
        }
      })
        .then(() => {
          this.getDetail(this.detail._id)
        })
        .catch(err => {
          console.log(err)
        })
    },
    aUpvote (id) {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/answers/upvote`,
        method: 'patch',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          id: id
        }
      })
        .then(() => {
          this.getDetail(this.detail._id)
        })
        .catch(err => {
          console.log(err)
        })
    },
    aDownvote (id) {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/answers/downvote`,
        method: 'patch',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          id: id
        }
      })
        .then(() => {
          this.getDetail(this.detail._id)
        })
        .catch(err => {
          console.log(err)
        })
    },
    starToggle () {
      axios({
        url: `https://hackerflow-server.ismailnagib.xyz/questions/star`,
        method: 'patch',
        headers: {
          token: localStorage.getItem('token')
        },
        data: {
          id: this.detail._id
        }
      })
        .then(() => {
          this.getDetail(this.detail._id)
          if (this.menuIndex === 2) {
            this.getStarred(true)
          } else {
            this.getStarred()
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  watch: {
    $route () {
      if (this.$route.params.id) {
        this.getDetail(this.$route.params.id)
      } else {
        this.showAll = true
        this.detail = {}
      }
    }
  },
  created () {
    if (this.$route.params.id) {
      this.getDetail(this.$route.params.id)
    }
  },
  computed: {
    ...mapState(['signedIn', 'authUser', 'questions', 'menuIndex', 'starred'])
  }
}
</script>

<style>

</style>
