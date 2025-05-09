<script setup>
import { PinIcon, PinOffIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useSidebarStore } from '@/stores'
import { PROJECT_NAME } from '@/config'

const { isOpened, isPinned } = storeToRefs(useSidebarStore())
</script>

<template>
  <div 
    class="sidebar_outer"
    :class="{opened: isOpened, pinned: isPinned}">
    <div class="sidebar">

      <div class="btns-place">
        <button 
          class="btn pin-sidebar-btn" 
          title="Pin/Unpin sidebar" 
          @click="isPinned = !isPinned">
          <PinIcon v-if="!isPinned" size="20"/>
          <PinOffIcon v-else size="20"/>
        </button>
      </div>

      <div class="tree">
      </div>

      <footer>
        <div class="copyright">
          <img src="/favicon/icon.svg" alt="WEPICS" height="24" width="24">
          <p>© 2024 {{ PROJECT_NAME }}</p>
        </div>
        <div class="links-place">
          <a target="_blank" href="https://github.com/kopchan/wepics-vue">Github</a>
        </div>
      </footer>

    </div>
    <div class="resizer"><div class="bar"></div></div>
  </div>
</template>

<style lang="scss">
.sidebar_outer {
  z-index: 50;
  position: fixed;
  top: 0;
  left: calc(var(--sidebar-width) * -1);
  width: var(--sidebar-width);
  padding-top: var(--header-height);
  min-width: 250px;
  max-width: 80%;
  height: 100%;
  background: linear-gradient(90deg, var(--c-b0), var(--c-b0a));
  backdrop-filter: blur(var(--div-blur));
  overflow-x: hidden;
  box-sizing: border-box;
  opacity: 0;
  transition: left 0.1s, opacity 0.1s;
  display: grid;
  grid-template-columns: 1fr 16px;
  @media (max-width: 450px) {
    left: -100%;
    width: 100vw;
    background: var(--c-b0a);
  }
}

.sidebar {
  box-sizing: border-box;
  padding: 8px 0 8px 8px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  gap: 16px;
  height: 100%;
  // Быстрые кнопки
  .btns-place {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    @media (max-width: 716px) {
      .pin-sidebar-btn {
        display: none;
      }
    }
  }
  // Дерево
  //.tree {
  //  &:hover .tree-item .branches {
  //    border-left: 1px solid var(--c-b4);
  //  }
  //  &-item {
  //    cursor: pointer;
  //    display: block;
  //    /*
  //    &:hover > .label {
  //      text-decoration: underline;
  //    }
  //    */
  //    input[type="checkbox"] {
  //      visibility: hidden;
  //      width:  0;
  //      height: 0;
  //    }
  //    .label {
  //      font-size: 16px;
  //      color: var(--c-t7);
  //      display: inline-flex;
  //      align-items: center;
  //      border-radius: var(--border-r);
  //      padding-right: 8px;
  //      height: 32px;
  //      /*
  //      &:hover {
  //        background: var(--c-b4a);
  //      }
  //      */
  //      &::before {
  //        content: '';
  //        background: url("../img/icon/arrow-corner_gray.svg");
  //        display: inline-block;
  //        width:  20px;
  //        height: 20px;
  //        margin-right:    4px;
  //        vertical-align: -4px;
  //      }
  //    }
  //    input[type="checkbox"]:checked + .label {
  //      color: var(--c-t0);
  //    }
  //    .branches {
  //      display: none;
  //      margin-left: 8px;
  //      border-left: 1px solid transparent;
  //      transition: 0.2s;
  //      /*
  //      display: flex;
  //      flex-direction: column;
  //      gap: 8px;
  //      */
  //    }
  //    input[type="checkbox"]:checked + .label + .branches {
  //      display: block;
  //    }
  //    input[type="checkbox"]:checked + .label::before {
  //      background: url("../img/icon/arrow-corner.svg");
  //      transform: rotate(90deg);
  //    }
  //  }
  //}
  // Подвал
  footer {
    margin-top: auto;
    .copyright {
      margin-bottom: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .links-place {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      a {
        color: var(--c-a5);
        text-decoration: unset;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 24px;
        padding: 0 6px;
        font-size: 14px;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
// Логика бокового меню
.sidebar_outer.opened {
    left: 0;
    opacity: 1;
  @media (max-width: 450px) {
    overflow: hidden; //cкрытие полос прокрутки в полноэкранном меню
  }
}
.sidebar_outer.opened.pinned .grid_outer {
  margin-left: var(--sidebar-width);
}
// Палка для изменения размера бокового меню
.sidebar_outer .resizer {
  cursor: col-resize;
  height: 100%;
  display: flex;
  align-items:     center;
  justify-content: center;
  @media (max-width: 450px) {
    display: none;
  }
  .bar {
    height: 20%;
    width:  7px;
    background: var(--c-b4);
    border-radius: 4px;
    transition: 0.2s;
  }
  &:hover  .bar {
    background: var(--c-t7);
  }
}
.sidebar_outer:not(:hover) .resizer .bar {
  @media (hover: hover) {
    background-color: transparent;
  }
}
.sidebar--resize-active .resizer .bar {
  background: var(--c-t7);
  height: 65%;
}
</style>