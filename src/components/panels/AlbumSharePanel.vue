<script setup>
import { toRefs, ref } from 'vue'
import { fetchWrapper } from '@/helpers'
import { BanIcon, CircleMinusIcon, PlusIcon } from 'lucide-vue-next'
import { urls } from '@/api';

// Параметры компонента
const props = defineProps({
  hash: String
})
// Параметры компонента в переменные
const { hash } = toRefs(props)

const isErrored = ref(false) // Статус "произошла ошибка"
const isLoading = ref(true) // Статус "загружается"

const disallowedRights = ref([]) // Список не допущенных
const allowedRights = ref([])   // Список допущенных
const isForGuest = ref(null)   // Статус "для гостей доступ открыт"
const guestObj = {
  user_id: null,
  nickname: 'guest'
}

// Запрос списка прав на выбранном альбоме
fetchWrapper.get(
  urls.albumAccesses(hash.value)
).then(data => {
  isLoading.value = false
  isForGuest      .value = data.isGuestAllowed ?? null
  allowedRights   .value = data.listAllowed    ?? []
  disallowedRights.value = data.listDisallowed ?? []

  if (isForGuest.value === true ) 
    allowedRights.value.push(guestObj)
  if (isForGuest.value === false) 
    disallowedRights.value.push(guestObj)
}).catch(() => {
  isLoading.value = false
  isErrored.value = true
})

// Удаление правила
const removeAccess = (user_id = null) => {
  fetchWrapper.delete(
    urls.albumAccesses(hash.value), {user_id}
  )
  if (user_id) {
    allowedRights.value = allowedRights.value
      .filter(el => !(el.user_id === user_id))

    disallowedRights.value = disallowedRights.value
      .filter(el => !(el.user_id === user_id))
  }
}

const mode = ref('show') // Режим отображения
const users = ref([]) // Список пользователей системы
// Переключение на страницу выбора пользователя для создания правила
const toUserSelect = () => {
  mode.value = 'addRule'
  isLoading.value = true

  // Получение всех пользователей
  fetchWrapper.get(urls.users()).then(gettedUsers => {
    // Все правила на выбранном альбоме
    const rules = [
      ...(   allowedRights.value), 
      ...(disallowedRights.value)
    ]
    // Добавление гостя в список пользователей
    gettedUsers.push({id: null, nickname: 'guest'})
    
    // Запись допущенных для выборки создания правила 
    // т.е. пользователи, которые не указаны в правилах выбранного альбома
    users.value = gettedUsers.filter(user => {
      for (const rule of rules) {
        if (rule.user_id === user.id)
          return false
      }
      return true
    })
    isLoading.value = false
  }).catch(() => {
    isLoading.value = false
    isErrored.value = true
  })
} 

// Создания правила
const addAccess = (user = null, isAllow = true) => {
  fetchWrapper.post(
    urls.albumAccesses(hash.value), {user_id: user.id, allow: isAllow}
  ).then(() => {
    if (isAllow) allowedRights.value.push({user_id: user.id, nickname: user.nickname})
    else      disallowedRights.value.push({user_id: user.id, nickname: user.nickname})
    mode.value = 'show'
  }).catch(() => {
    isLoading.value = false
    isErrored.value = true
  })
}
</script>

<template>
  <div class="outer">
    <h4>{{ mode === 'show' ? 'Access management' : 'Adding rule' }}</h4>

    <template v-if="isLoading">
      <p>Loading...</p>
    </template>

    <template v-else-if="isErrored">
      <p>Something going wrong</p>
    </template>

    <template v-else-if="mode === 'show'">
      <template v-if="allowedRights?.length">
        <p>Allowed users</p>
        <div class="users">
          <div v-for="access in allowedRights" 
            :key="access"
            class="user-line">
            <span :class="{guest: access.user_id === null}">
              {{ access.nickname }}
            </span>
            <div style="margin-left: auto"></div>
            <button 
              class="btn btn--danger btn--quad"
              @click="removeAccess(access.user_id)">
              <CircleMinusIcon size="20"/>
            </button>
          </div>
        </div>
      </template>

      <template v-if="disallowedRights?.length">
        <p>Disallowed users</p>
        <div class="users">
          <div 
            v-for="access in disallowedRights" 
            :key="access"
            class="user-line">
            <span :class="{guest: access.user_id === null}">
              {{ access.nickname }}
            </span>
            <div style="margin-left: auto"></div>
            <button 
              class="btn btn--danger btn--quad"
              @click="removeAccess(access.user_id)">
              <CircleMinusIcon size="20"/>
            </button>
          </div>
        </div>
      </template>

      <p v-if="!disallowedRights?.length && 
               !allowedRights   ?.length">
        There are no rules
      </p>

      <button class="btn btn--main" @click="toUserSelect">Add rule</button>
    </template>

    <template v-else>
      <div class="users">
        <div 
          v-for="user in users"
          :key="user"
          class="user-line">
          <span :class="{guest: user.id === null}">{{ user.nickname }}</span>
          <div style="margin-left: auto"></div>
          <button 
            class="btn btn--danger btn--quad"
            @click="addAccess(user, true)">
            <PlusIcon size="20"/>
          </button>
          <button 
            class="btn btn--danger btn--quad"
            @click="addAccess(user, false)">
            <BanIcon size="20"/>
          </button>
        </div>
      </div>
      <button class="btn btn--main" @click="mode = 'show'">Cancel</button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
h4 {
  text-align: center;
}
p {
  text-align: center;
  margin-top: 12px;
}
.users {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.user-line {
  display: flex;
  align-items: center;
  gap: 6px;
  span {
    overflow: hidden;
    font-weight: 600;
    text-overflow: ellipsis;
    &.guest {
      padding: 2px 6px;
      background-color: var(--c-t0);
      color: var(--c-b0);
      border-radius: var(--border-r);
    }
  }
}
.btn--main {
  background-color: var(--c-b0a);
  &:hover {
    background-color: var(--c-b4a);
  }
  &:active {
    background-color: var(--c-b4);
  }
}
</style>
