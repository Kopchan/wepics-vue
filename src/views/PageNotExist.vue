<template>
  <div class="outer">
    <div class="card">
      <p>404</p>
      <RouterLink class="btn" to="/">To Home</RouterLink>
    </div>
  </div>
</template>

<style>
.outer {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  p {
    text-align: center;
    font-size: 48px;
  }
}
</style>