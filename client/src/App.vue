<!-- App.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <Navigation />

    <!-- Main content -->
    <main class="pt-16">
      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <div :key="$route.fullPath"> <!-- Add wrapper div -->
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </div>
    </main>
  </div>
  <Footer />
  <NotificationContainer />
</template>

<script setup>
import Navigation from './components/ui/Navigation.vue'
import Footer from './components/ui/Footer.vue'
import NotificationContainer from './components/ui/NotificationContainer.vue'
</script>

<style>
/* Replace existing transition styles */

/* Fade and slide transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Optional: Add will-change for performance */
.page-enter-active,
.page-leave-active {
  will-change: transform, opacity;
}
</style>