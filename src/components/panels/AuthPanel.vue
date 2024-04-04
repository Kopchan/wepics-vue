<script setup>
import { ref, watch } from 'vue'
import { BtnRadios } from '@/components/ui'
import { useAuthStore } from '@/stores'

const mode = ref('login')
const form = ref({})
const error = ref(null)
const isFetching = ref(false)

const auth = useAuthStore()

const authorize = () => {
  isFetching.value = true
  error.value = null

  auth[mode.value](form.value)
    .catch(err => error.value = err)

  isFetching.value = false
}
watch(
  () => [mode.value, form.value],
  () => error.value = null,
  { deep: true }
)
</script>

<template>
  <div class="outer">
    <BtnRadios name="mode" v-model="mode" :options="{login: 'Log In', signup: 'Sign Up'}"/>
    <form @submit.prevent="authorize" v-if="mode == 'login'">
      <input class="text-box" required v-model="form.login"    placeholder="Login">
      <input class="text-box" required v-model="form.password" placeholder="Password" type="password">
      <button class="btn" :disable="isFetching">Enter</button>
      <div class="error" v-if="error">
        <p v-if="error.status == 401">Login and/or password not correct</p>
        <p v-else>Authorization failed</p>
      </div>
    </form>
    <form @submit.prevent="authorize" v-else>
      <input class="text-box" required v-model="form.nickname" placeholder="Nickname">
      <input class="text-box" required v-model="form.login"    placeholder="Login">
      <input class="text-box" required v-model="form.password" placeholder="Password" type="password">
      <button class="btn" :disable="isFetching">Create</button>
      <div class="error" v-if="error">
        <template v-if="error.status == 422">
          <template v-for="errorArr in error.message" :key="errorArr">
            <template v-for="error in errorArr" :key="error">
              <p>{{ error }}</p>
            </template>
          </template>
        </template>
        <p v-else>Registration failed</p>
      </div>
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
  background-color: var(--c-b0a);
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px
}
.error {
  background-color: #a004;
  padding: 10px;
  border-radius: var(--border-r);
}
</style>
