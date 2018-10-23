<template>
  <div>
    <div class="row" id='main'>
      <div class="col-2"></div>
      <div class="col-3">
        <questionlist></questionlist>
      </div>
      <div class="col-5">
        <questionlarge></questionlarge>
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
  components: {
    questionlarge,
    questionlist
  }
}
</script>

<style>

</style>
