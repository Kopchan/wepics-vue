<script setup>
import { storeToRefs } from 'pinia'
import { useAlbumParamsStore } from '@/stores'
import { imagesSortTypes, albumsSortTypes } from '@/api'
import { SelectorRadios2 } from '@/components/ui'
import { ArrowDown10Icon, ArrowDownAZIcon, ArrowUp10Icon, ArrowUpAZIcon } from 'lucide-vue-next'

// Параметры в ссылке
const  {
  sort, 
  sortAlbums,
  isReverse, 
  isReverseAlbums, 
  nested, 
  disrespect,
  randomSeed,
} = storeToRefs(useAlbumParamsStore())

</script>

<template>
  <div class="outer">
    <h4>Sort & Filter</h4>

    <!-- Медиа -->
    <div class="label-group">
      <label>Media sort</label>
      <button 
        @click="isReverse = !isReverse"
        :disabled="sort === 'random'"
        :class="{
          'btn': true,
          'reverse': true,
          'btn--inverse': isReverse,
      }">
        Reverse
        <template v-if="sort == 'name'">
          <ArrowUpAZIcon size="20" v-if="isReverse"/>
          <ArrowDownAZIcon size="20" v-else/>
        </template>
        <template v-else>
          <ArrowUp10Icon size="20" v-if="isReverse"/>
          <ArrowDown10Icon size="20" v-else/>
        </template>
      </button>
    </div>
    
    <SelectorRadios2 
      :options="imagesSortTypes" 
      v-model="sort" 
      name="mediasSort" 
      noCenter
      grid
    />

    <div class="label-group">
      <label>Show nested media</label>
      <label class="switch"><input type="checkbox" v-model.number="nested"/><div></div></label>
    </div>

    <!-- Альбомы -->
    <div class="label-group">
      <label>Albums sort</label>
      <button 
        @click="isReverseAlbums = !isReverseAlbums"
        :disabled="sortAlbums === 'random'"
        :class="{
          'btn': true,
          'reverse': true,
          'btn--inverse': isReverseAlbums,
      }">
        Reverse
        <template v-if="sortAlbums == 'name'">
          <ArrowUpAZIcon size="20" v-if="isReverseAlbums"/>
          <ArrowDownAZIcon size="20" v-else/>
        </template>
        <template v-else>
          <ArrowUp10Icon size="20" v-if="isReverseAlbums"/>
          <ArrowDown10Icon size="20" v-else/>
        </template>
      </button>
    </div>
    
    <SelectorRadios2 
      :options="albumsSortTypes" 
      v-model="sortAlbums" 
      name="albumSort" 
      noCenter
      grid
    />

    <div class="label-group">
      <label>Ignore custom order</label>
      <label class="switch"><input type="checkbox" v-model.number="disrespect"/><div></div></label>
    </div>

    <div class="label-group" v-if="sortAlbums === 'random' || sort === 'random'">
      <label>Random seed</label>
      <input class="text-box small" type="number" v-model="randomSeed" maxlength="10" placeholder="null"/>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.outer {
  width: 275px;
  display: flex;
  flex-direction: column;
  gap: 12px
}
h4 {
  text-align: center;
}
.reverse {
  gap: 6px
}
.small {
  width: 75px;
}
</style>
