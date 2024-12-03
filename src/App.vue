<script setup>
import AuthLayout from './components/auth/AuthLayout.vue'
</script>

<template>
  <div class="app">
    <AuthLayout />
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  background-color: #f8f9fa;
}

.app {
  min-height: 100vh;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
