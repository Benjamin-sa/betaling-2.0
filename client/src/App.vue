<script setup>
import AuthLayout from './components/auth/AuthLayout.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AuthLayout />
    <main class="container mx-auto px-4 py-8 max-w-7xl">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
