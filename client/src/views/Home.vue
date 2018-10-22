<template>
  <div>
    <div class="row" id='main'>
      <div class="col-2"></div>
      <div class="col-3">
        <questionlist @questions='updateQuestion' :signedin='signedin' :reload='reload'></questionlist>
      </div>
      <div class="col-5">
        <questionlarge @reload='needReload' :questions='questions' :authuser='authuser' :signedin='signedin'></questionlarge>
      </div>
      <div class="col-2"></div>
    </div>
  </div>
</template>

<script>
import questionlarge from '@/components/questionLarge'
import questionlist from '@/components/questionList'

export default {
  name: 'blog',
  props: ['signedin', 'authuser'],
  data () {
    return {
      questions: [],
      reload: false,
      address: ''
    }
  },
  components: {
    questionlarge,
    questionlist
  },
  methods: {
    updateQuestion (value) {
      this.questions = value
    },
    needReload () {
      this.reload = true
      setTimeout(() => {
        this.reload = false
      }, 1000)
    },
    updateAddress (value) {
      this.address = value
    }
  }
}
</script>

<style>

</style>
