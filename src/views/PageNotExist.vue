<template>
  <div class="outer">
    <div class="card">
      <h2>404</h2>
      <p>Page not found</p>
      <a v-if="$router.options.history.state.position" class="btn" @click="$router.back()">Back</a>
      <RouterLink class="btn" to="/">To Home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.outer {
  height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  h2 {
    text-align: center;
    font-size: 48px;
    font-weight: unset;
  }
  p {
    font-weight: bold;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
}
</style>