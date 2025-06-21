<script setup>
import { ref, watch } from 'vue'
import { BtnRadios } from '@/components/ui'
import { useAuthStore } from '@/stores'
import { InputFormItem } from '@/components/form'

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
      <InputFormItem     v-model="form" :error="error" name="login" label="Login"/>
      <InputFormItem     v-model="form" :error="error" name="password" label="Password" type="password"/>
      <button class="btn" :disable="isFetching">Enter</button>
      <!-- Окно ошибки -->
      <div class="error" v-if="error">
        <p v-if="error.status == 401">Login and/or password not correct</p>
        <p v-else>Authorization failed</p>
      </div>
    </form>
    <!-- Форма регистрации -->
    <form @submit.prevent="authorize" v-else>
      <InputFormItem     v-model="form" :error="error" name="nickname" label="Nickname"/>
      <InputFormItem     v-model="form" :error="error" name="login" label="Login"/>
      <InputFormItem     v-model="form" :error="error" name="password" label="Password" type="password"/>
      <button class="btn" :disable="isFetching">Create</button>
      <!-- Окно ошибки -->
      <div class="error" v-if="error">
        <template v-if="error.status == 422">
          <p>Request validation error</p>
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
}
.error {
  background-color: #a004;
  padding: 10px;
  border-radius: var(--border-r);
}
</style>
