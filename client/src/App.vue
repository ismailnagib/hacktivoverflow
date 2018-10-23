<template>
  <div id="app">
    <div id="nav">
      <div id='navlinks'>
        <router-link to="/">HACKER<b>FLOW</b></router-link>
        <signform></signform>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
import signform from '@/components/signForm.vue'

export default {
  name: 'app',
  components: {
    signform
  }
}
</script>

<style>
@import "~vue-wysiwyg/dist/vueWysiwyg.css";
</style>
