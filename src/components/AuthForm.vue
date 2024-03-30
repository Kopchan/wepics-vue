<script setup>
import { ref } from 'vue'

const page = ref('login')
const form = ref({})
</script>

<template>
  <div>
    <div>
      <input type="radio" v-model="page" value="login">Log In
      <input type="radio" v-model="page" value="signup">Sign Up
    </div>
    <form v-if="page == 'login'">
      <input required v-model="form.email"    placeholder="Login">
      <input required v-model="form.password" placeholder="Password">
    </form>
    <form v-else>
      <input required v-model="form.nickname" placeholder="Nickname">
      <input required v-model="form.email"    placeholder="Login">
      <input required v-model="form.password" placeholder="Password">
    </form>
  </div>
</template>