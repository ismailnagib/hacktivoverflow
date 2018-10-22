<template>
  <div id="app">
    <div id="nav">
      <div id='navlinks'>
        <router-link to="/">HACK<b>OVER</b></router-link>
        <signform @usi='updateSignedIn' @uau='updateAuthUser'></signform>
      </div>
    </div>
    <router-view :signedin='signedIn' :authuser='authUser'/>
  </div>
</template>

<script>
import signform from '@/components/signForm.vue'

export default {
  name: 'app',
  data () {
    return {
      signedIn: false,
      authUser: null
    }
  },
  components: {
    signform
  },
  methods: {
    updateSignedIn (value) {
      this.signedIn = value
    },
    updateAuthUser (value) {
      this.authUser = value
    }
  }
}
</script>

<style>
@import "~vue-wysiwyg/dist/vueWysiwyg.css";
</style>