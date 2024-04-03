<script setup>
import { ref } from 'vue'
import BtnRadios from '@/components/ui/BtnRadios.vue'
import { fetchWrapper } from '@/helpers'

const mode = ref('login')
const form = ref({})

const authorize = () => {
  console.log(fetchWrapper.post('/users/login', form.value))
}
</script>

<template>
  <div class="outer">
    <BtnRadios name="mode" v-model="mode" :options="{login: 'Log In', signup: 'Sign Up'}"/>
    <form v-if="mode == 'login'" @submit.prevent="authorize">
      <input class="text-box" required v-model="form.login"    placeholder="Login">
      <input type="password" class="text-box" required v-model="form.password" placeholder="Password">
      <button class="btn">Enter</button>
    </form>
    <form v-else @submit.prevent="registrate">
      <input class="text-box" required v-model="form.nickname" placeholder="Nickname">
      <input class="text-box" required v-model="form.login"    placeholder="Login">
      <input type="password" class="text-box" required v-model="form.password" placeholder="Password">
      <button class="btn">Create</button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 12px
}
button {
  background: var(--c-b0a);
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px
}
</style>
