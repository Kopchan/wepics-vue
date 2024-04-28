<script setup>
import { ref, watch } from 'vue'
import { BtnRadios } from '@/components/ui'
import { useAuthStore } from '@/stores'

const isFetching = ref(false) // Статус "загружается"
const mode = ref('login')    // Режим
const form = ref({})        // Отпровляемые данные 
const error = ref(null)    // Ошибка загрузки

// Стор с функциями входа/регистрации
const auth = useAuthStore()

// Функция входа/регистрации
const authorize = () => {
  isFetching.value = true
  error.value = null

  // Выбор входа/регистрации
  auth[mode.value](form.value)
    .catch(err => error.value = err)

  isFetching.value = false
}

// Следим за режимом и данными формы, при изменение очищаем ошибку
watch(
  () => [mode.value, form.value],
  () => error.value = null,
  { deep: true }
)
</script>

<template>
  <div class="outer">
    <!-- Селектор режима -->
    <BtnRadios name="mode" v-model="mode" :options="{login: 'Log In', signup: 'Sign Up'}"/>
    <!-- Форма входа -->
    <form @submit.prevent="authorize" v-if="mode == 'login'">
      <input class="text-box" required v-model="form.login"    placeholder="Login">
      <input class="text-box" required v-model="form.password" placeholder="Password" type="password">
      <button class="btn" :disable="isFetching">Enter</button>
      <!-- Окно ошибки -->
      <div class="error" v-if="error">
        <p v-if="error.status == 401">Login and/or password not correct</p>
        <p v-else>Authorization failed</p>
      </div>
    </form>
    <!-- Форма регистрации -->
    <form @submit.prevent="authorize" v-else>
      <input class="text-box" required v-model="form.nickname" placeholder="Nickname">
      <input class="text-box" required v-model="form.login"    placeholder="Login">
      <input class="text-box" required v-model="form.password" placeholder="Password" type="password">
      <button class="btn" :disable="isFetching">Create</button>
      <!-- Окно ошибки -->
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
