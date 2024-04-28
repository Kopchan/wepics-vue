<script setup>
import { useAuthStore } from '@/stores'
import { storeToRefs } from 'pinia'

const auth = useAuthStore()

const { user } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="outer">
    <div>
      <p class="gray">
        You are logged in as
        <span v-if="user.isAdmin" class="badge">admin</span>
      </p>
      <p class="name">
        {{ user.nickname }}
      </p>
    </div>
    <button class="btn" @click="auth.logout">Log Out</button>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.gray {
  color: var(--c-t2a);
  font-size: 12px;
  display: flex;
  justify-content: space-between;
}
.badge {
  font-size: 12px;
  background-color: var(--c-t0);
  color: var(--c-b0);
  padding: 2px 5px;
  border-radius: var(--border-r);
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
}
button {
  background-color: var(--c-b0a);
}
</style>
