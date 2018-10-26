<template>
  <div id='signform'>
    <div id='signinit'>
      <div style="margin: auto">
        <div id='g-signin-btn' class="border-bottom mt-4 pb-3">
          <span class="g-signin2" data-onsuccess="onSignIn" style="width: 175px"></span>
        </div>
        <button v-if='signedIn' @click='signout' onclick='gSignOut' class='signModalBtn'><strong>Sign Out</strong></button>
        <button v-else @click='signModal' class='signModalBtn'><strong>Sign In / Sign Up</strong></button>
        <div>or scroll down</div>
      </div>
    </div>
    <div id='signBackdrop' v-if='openSignModal'></div>
    <div id='signModal' v-if='openSignModal'>
      <button class='mt-4' @click='signModal' style="background: transparent; color: white; font-size: 30px; border: none; cursor: pointer; outline: none"><i class="far fa-times-circle"></i></button><br><br>
      <div v-if='isSigningUp'><input class='mx-2' v-model='name' type="text" placeholder="Name" @keyup.enter="onEnter"><br></div>
      <div v-else><input id='phInput' readonly></div>
      <input class='mx-2' v-model='email' type="email" placeholder="Email" @keyup.enter='onEnter'><br>
      <input class='mx-2' v-model='password' type="password" placeholder="Password" @keyup.enter="onEnter"><br>
      <div id='signBtn'>
        <button @click='signin()' :class="{ active: !isSigningUp }"><strong>Sign In</strong></button>
        <button @click='signup()' :class="{ active: isSigningUp }" ><strong>Sign Up</strong></button>
      </div>
      <div v-if="notice.length > 0" class='unselectable mt-4 mb-4' style="padding: 0 10%" id='notice'><b>{{ notice }}</b></div>
      <div v-else class="placeholder mt-4 mb-4">placeholder</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import store from '@/store'
import { mapMutations, mapActions } from 'vuex'

export default {
  name: 'signform',
  store,
  data () {
    return {
      signedIn: false,
      openSignModal: false,
      isSigningUp: false,
      afterSignUp: false,
      name: '',
      email: '',
      password: '',
      notice: ''
    }
  },
  methods: {
    ...mapMutations(['mutateSignedIn', 'mutateAuthUser']),
    ...mapActions(['getStarred']),
    signModal () {
      this.openSignModal = !this.openSignModal
      this.isSigningUp = false
      this.name = ''
      this.email = ''
      this.password = ''
      this.notice = ''
    },
    onEnter () {
      if (this.isSigningUp) {
        this.signup()
      } else {
        this.signin()
      }
    },
    signin () {
      if (this.isSigningUp) {
        this.isSigningUp = false
        if (!this.afterSignUp) {
          this.notice = ''
        } else {
          this.afterSignUp = false
        }
      } else {
        axios({
          url: 'https://hackerflow-server.ismailnagib.xyz/users/login',
          method: 'post',
          data: {
            email: this.email,
            password: this.password
          }
        })
          .then(data => {
            localStorage.setItem('token', data.data.token)
            this.signedIn = true
            this.mutateSignedIn(true)
            this.mutateAuthUser(data.data.userId)
            this.getStarred()
            this.signModal()
            location.reload()
          })
          .catch(err => {
            this.notice = err.response.data.message
          })
      }
    },
    signup () {
      if (!this.isSigningUp) {
        this.isSigningUp = true
        this.notice = ''
      } else {
        axios({
          url: 'https://hackerflow-server.ismailnagib.xyz/users/register',
          method: 'post',
          data: {
            name: this.name,
            email: this.email,
            password: this.password
          }
        })
          .then(data => {
            this.afterSignUp = true
            this.notice = 'Registration successful, sign in now to unlock all our services.'
            this.name = ''
            this.password = ''
            this.signin()
          })
          .catch(err => {
            this.notice = err.response.data.message
          })
      }
    },
    signout () {
      localStorage.clear()
      this.signedIn = false
      this.mutateSignedIn(false)
      this.mutateAuthUser(null)
      location.reload()
    },
    checkSignedIn () {
      axios({
        url: 'https://hackerflow-server.ismailnagib.xyz/users/checklogin',
        method: 'post',
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(data => {
          this.signedIn = true
          this.mutateSignedIn(true)
          this.mutateAuthUser(data.data.userId)
          this.getStarred()
        })
        // eslint-disable-next-line
        .catch(err => {
          this.signedIn = false
          this.mutateSignedIn(false)
        })
    }
  },
  created () {
    this.checkSignedIn()
  }
}
</script>

<style>

</style>
