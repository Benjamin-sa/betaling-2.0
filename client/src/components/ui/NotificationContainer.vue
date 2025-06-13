<template>
    <teleport to="body">
        <div class="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
            <transition-group name="notification" tag="div">
                <div v-for="notification in notifications" :key="notification.id"
                    :class="getNotificationClasses(notification.type)"
                    class="notification-card rounded-xl shadow-xl border overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:scale-105">
                    <!-- Header with icon and close button -->
                    <div class="flex items-start p-4">
                        <div class="flex-shrink-0 mt-1">
                            <div :class="getIconBgClasses(notification.type)"
                                class="w-8 h-8 rounded-full flex items-center justify-center">
                                <component :is="getIcon(notification.type)" :class="getIconClasses(notification.type)"
                                    class="w-4 h-4" />
                            </div>
                        </div>

                        <div class="ml-3 flex-1 min-w-0">
                            <h4 v-if="notification.title" :class="getTitleClasses(notification.type)"
                                class="text-sm font-semibold leading-tight">
                                {{ notification.title }}
                            </h4>
                            <p v-if="notification.message" :class="getMessageClasses(notification.type)"
                                class="text-sm mt-1 leading-relaxed">
                                {{ notification.message }}
                            </p>
                        </div>

                        <div class="ml-3 flex-shrink-0">
                            <button @click="removeNotification(notification.id)"
                                :class="getCloseButtonClasses(notification.type)"
                                class="inline-flex rounded-full p-1 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2">
                                <span class="sr-only">Sluiten</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Progress bar for auto-dismiss -->
                    <div v-if="!notification.persistent" class="relative h-1 overflow-hidden">
                        <div :class="getProgressBarClasses(notification.type)"
                            class="progress-bar h-full w-full transform origin-left"
                            :style="{ animationDuration: notification.duration + 'ms' }">
                        </div>
                    </div>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.notifications)

// Icon components (using simple SVG templates)
const SuccessIcon = {
    template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  `
}

const ErrorIcon = {
    template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `
}

const WarningIcon = {
    template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  `
}

const InfoIcon = {
    template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const getIcon = (type) => {
    switch (type) {
        case 'success': return SuccessIcon
        case 'error': return ErrorIcon
        case 'warning': return WarningIcon
        case 'info': return InfoIcon
        default: return InfoIcon
    }
}

const getNotificationClasses = (type) => {
    const baseClasses = 'border-l-4 bg-white/95'
    switch (type) {
        case 'success':
            return `${baseClasses} border-emerald-400 shadow-emerald-100`
        case 'error':
            return `${baseClasses} border-red-400 shadow-red-100`
        case 'warning':
            return `${baseClasses} border-amber-400 shadow-amber-100`
        case 'info':
            return `${baseClasses} border-blue-400 shadow-blue-100`
        default:
            return `${baseClasses} border-gray-400 shadow-gray-100`
    }
}

const getIconBgClasses = (type) => {
    switch (type) {
        case 'success': return 'bg-emerald-100'
        case 'error': return 'bg-red-100'
        case 'warning': return 'bg-amber-100'
        case 'info': return 'bg-blue-100'
        default: return 'bg-gray-100'
    }
}

const getIconClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-600'
        case 'error': return 'text-red-600'
        case 'warning': return 'text-amber-600'
        case 'info': return 'text-blue-600'
        default: return 'text-gray-600'
    }
}

const getTitleClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-900'
        case 'error': return 'text-red-900'
        case 'warning': return 'text-amber-900'
        case 'info': return 'text-blue-900'
        default: return 'text-gray-900'
    }
}

const getMessageClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-700'
        case 'error': return 'text-red-700'
        case 'warning': return 'text-amber-700'
        case 'info': return 'text-blue-700'
        default: return 'text-gray-700'
    }
}

const getCloseButtonClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500'
        case 'error': return 'text-red-400 hover:text-red-600 hover:bg-red-50 focus:ring-red-500'
        case 'warning': return 'text-amber-400 hover:text-amber-600 hover:bg-amber-50 focus:ring-amber-500'
        case 'info': return 'text-blue-400 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
        default: return 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:ring-gray-500'
    }
}

const getProgressBarClasses = (type) => {
    switch (type) {
        case 'success': return 'bg-gradient-to-r from-emerald-400 to-emerald-500'
        case 'error': return 'bg-gradient-to-r from-red-400 to-red-500'
        case 'warning': return 'bg-gradient-to-r from-amber-400 to-amber-500'
        case 'info': return 'bg-gradient-to-r from-blue-400 to-blue-500'
        default: return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
}

const removeNotification = (id) => {
    notificationStore.removeNotification(id)
}
</script>

<style scoped>
/* Notification enter/leave transitions */
.notification-enter-active {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
    transition: all 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
}

.notification-move {
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Progress bar animation */
.progress-bar {
    animation: shrink linear forwards;
    transform-origin: left center;
}

@keyframes shrink {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(0);
    }
}

/* Add subtle animations */
.notification-card {
    animation: slideInBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideInBounce {
    0% {
        opacity: 0;
        transform: translateX(100%) scale(0.8);
    }

    60% {
        opacity: 1;
        transform: translateX(-5%) scale(1.02);
    }

    100% {
        opacity: 1;
        transform: translateX(0%) scale(1);
    }
}

/* Hover effects */
.notification-card:hover {
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
}
</style>
