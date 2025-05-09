<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore, useServerSetupsStore } from '@/stores'
import { BtnRadios } from '@/components/ui'
import { computed, onMounted, ref, toRaw } from 'vue'
import AgeRatingLabel from '../AgeRatingLabel.vue'
import SelectorRadios from '../ui/SelectorRadios.vue'
import { EyeIcon, EyeOffIcon, GripIcon, SlashIcon } from 'lucide-vue-next'

// Стор с глобальными серверными преднастроками
const setups = useServerSetupsStore()
const { 
  ageRatings: globalRatings, 
  allowedReactions: globalReactions,
} = storeToRefs(setups)

const { user } = storeToRefs(useAuthStore())

const onThing = ref('global')
const onThingOptions = {
  current: 'This album', 
  global: 'Any album', 
}

const forWho = ref('device')
const forWhoOptions = computed(() => {
  const options = { device: 'This device' }

  if (user.value) {
    options.yourself = 'My account'
    
    if (user.value?.isAdmin)
      options.everyone = 'Any user'
  }

  return options
})

const ratingPresetOptions = computed(() => {
  const options = {}

  if (!(onThing.value === 'global' && forWho.value === 'everyone'))
    options.inherit = { name: 'Inherit rule', icon: SlashIcon }
  
  options.show = { name: 'Show images', icon: EyeIcon   , color: 'var(--green)'  }
  options.blur = { name: 'Blur images', icon: GripIcon  , color: 'var(--yellow)' }
  options.hide = { name: 'Hide images', icon: EyeOffIcon, color: 'var(--red)'    }

  return options
})

const ageRatings = computed(() => {
  const ratings = globalRatings.value

  globalRatings.value.forEach(rat => {
    rat.settedPreset = rat?.devicePreset ?? 'inherit'
    //console.log(rat?.devicePreset, rat.settedPreset)
  })

  if (onThing.value === 'global') {
    if (forWho.value === 'everyone') {
      ratings.forEach(rat => {
        rat.settedPreset = rat.preset
      })
    }
  }

  return ratings
})

const handleSave = () => {
  if (onThing.value === 'global') {
    if (forWho.value === 'device') {
      globalRatings.value.forEach(rat => {
        const setted = rat.settedPreset

        if (setted && setted != 'inherit') {
          rat.devicePreset = setted
          rat.preset = setted
          setups.ratingsStorage[rat.code] = setted
        }
        else {
          rat.preset = rat.globalPreset
          delete setups.ratingsStorage[rat.code]
          //delete setups.ratingsStorage[rat.code]
        }
      })
    }
  }
}

const handleReset = () => {
  globalRatings.value.forEach(rat => {
    if (!(onThing.value === 'global' && forWho.value === 'everyone')) {
      rat.settedPreset = 'inherit'
      delete rat.devicePreset
      delete setups.ratingsStorage[rat.code]
    }
    else {
      rat.settedPreset = rat.globalPreset
      rat.preset = rat.globalPreset
    }
  })
}

</script>

<template>
  <div class="outer">
    <h4>Setups</h4>

    <!-- Выбор уровня настроек -->
    <div class="label-group">
      <label>On</label>
    </div>
    <BtnRadios name="on" v-model="onThing" :options="onThingOptions"/>

    <div class="label-group">
      <label>For</label>
    </div>
    <BtnRadios name="for" v-model="forWho" :options="forWhoOptions"/>
    
    <div class="label-group">
      <label>Age ratings</label>
    </div>
    <div class="list ratings">
      <div class="item"
        v-for="rating, key in ageRatings"
        :key="key">
          <div class="name">
            <AgeRatingLabel class="ratingLabel" :rating="rating"/>
          </div>
          <div class="selector">
            <SelectorRadios 
              :name="'ratingPreset_'+ key"
              :options="ratingPresetOptions" 
              :point="rating?.globalPreset"
              v-model="rating.settedPreset"
              squared
            />
          </div>
      </div>
    </div>

    <button class="btn" @click="handleSave">Save</button>
    <button class="btn" @click="handleReset">Reset</button>
  </div>
</template>

<style lang="scss" scoped>
.outer {
  min-width: 0;
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
.ratingLabel {
  min-width: 75px;
}
button {
  background-color: var(--c-b0a);
}
h4 {
  text-align: center;
}
</style>