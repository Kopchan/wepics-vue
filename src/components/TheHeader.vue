<template>
  <header>
    <div class="header_inner d-flex ai-cen">
      <!--    =  Кнопка меню  =    -->
      <div class="menu-btn-place">
        <button class="btn btn--quad menu-btn" title="Toggle menu" onclick="toggleSidebar()">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path>
          </svg>
        </button>
      </div>
      <!--    =  Путь  =    -->
      <div class="path-line">
        <span class="section"><a href="" class="btn">Home</a></span>
        <span class="section"><a href="" class="btn">ATyans</a></span>
        <span class="section"><a href="" class="btn">Port</a></span>
        <button class="btn btn--circle folder-select-btn" title="Show subfolders">&gt;</button>
      </div>
      <!--    =  Сортировка  =    -->
      <div class="sort-section">
        <button
          class="btn btn--quad change-direction-btn down"
          title="Change sort direction">
          <span>&uarr;</span>
        </button>
        <select class="droplist sort-droplist" title="Sort type">
          <option>Name</option>
          <option>Date</option>
          <option>Size</option>
          <option>Height</option>
          <option>Width</option>
        </select>
      </div>
    </div>
  </header>
</template>

<style lang="scss">
header {
  top: 0;
  background: linear-gradient(180deg, var(--c-b0), var(--c-b0a));
  position: fixed;
  width: 100%;
  z-index: 100;
  height: var(--header-height);
  backdrop-filter: blur(var(--div-blur));
  .header_inner {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 8px;
    gap: 8px;
  }
  // Путь
  .path-line {
    display: flex;
    height: 32px;
    align-items: center;
    .section {
      display: flex;
      align-items: center;
      &:not(:first-child) {
        &::before {
          content: '/';
          color: var(--c-t7);
          font-size: 24px;
          padding: 0 4px;
        }
      }
    }
    a {
      height: 24px;
      padding: 0 6px;
      border-radius: var(--border-r);
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .folder-select-btn {
      color: var(--c-t7);
      margin: 0 2px;
      &:hover {
        color: var(--c-t0);
      }
    }
  }
  // Сортировка
  .sort-section {
    display: flex;
    justify-self: end;
    margin-left: auto;
    gap: 4px;
    .change-direction-btn {
      .down {
        > * {
          transform: rotate(180deg);
        }
      }
    }
  }
}
</style>