<template>
    <teleport to="body">
        <!-- Mobile-first responsive positioning -->
        <div class="fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto sm:max-w-sm z-50 space-y-3">
            <transition-group name="notification" tag="div">
                <div v-for="notification in notifications" :key="notification.id"
                    :class="getNotificationClasses(notification.type)"
                    class="notification-card rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105">
                    <!-- Header with icon and close button -->
                    <div class="flex items-start p-4 sm:p-6">
                        <div class="flex-shrink-0 mt-0.5">
                            <div :class="getIconBgClasses(notification.type)"
                                class="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                                <component :is="getIcon(notification.type)" :class="getIconClasses(notification.type)"
                                    class="w-5 h-5 sm:w-4 sm:h-4" />
                            </div>
                        </div>

                        <div class="ml-4 sm:ml-3 flex-1 min-w-0">
                            <h4 v-if="notification.title" :class="getTitleClasses(notification.type)"
                                class="text-base sm:text-sm font-bold sm:font-semibold leading-tight">
                                {{ notification.title }}
                            </h4>
                            <p v-if="notification.message" :class="getMessageClasses(notification.type)"
                                class="text-sm sm:text-sm mt-1 leading-relaxed">
                                {{ notification.message }}
                            </p>
                        </div>

                        <div class="ml-4 sm:ml-3 flex-shrink-0">
                            <button @click="removeNotification(notification.id)"
                                :class="getCloseButtonClasses(notification.type)"
                                class="inline-flex rounded-full p-2 sm:p-1 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                <span class="sr-only">Sluiten</span>
                                <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Progress bar for auto-dismiss -->
                    <div v-if="!notification.persistent" class="relative h-1.5 sm:h-1 overflow-hidden">
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
    const baseClasses = 'border-l-4 bg-white/95 backdrop-blur-lg'
    switch (type) {
        case 'success':
            return `${baseClasses} border-emerald-500 shadow-emerald-200/50`
        case 'error':
            return `${baseClasses} border-red-500 shadow-red-200/50`
        case 'warning':
            return `${baseClasses} border-amber-500 shadow-amber-200/50`
        case 'info':
            return `${baseClasses} border-blue-500 shadow-blue-200/50`
        default:
            return `${baseClasses} border-emerald-500 shadow-emerald-200/50`
    }
}

const getIconBgClasses = (type) => {
    switch (type) {
        case 'success': return 'bg-emerald-100'
        case 'error': return 'bg-red-100'
        case 'warning': return 'bg-amber-100'
        case 'info': return 'bg-blue-100'
        default: return 'bg-emerald-100'
    }
}

const getIconClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-600'
        case 'error': return 'text-red-600'
        case 'warning': return 'text-amber-600'
        case 'info': return 'text-blue-600'
        default: return 'text-emerald-600'
    }
}

const getTitleClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-900'
        case 'error': return 'text-red-900'
        case 'warning': return 'text-amber-900'
        case 'info': return 'text-blue-900'
        default: return 'text-emerald-900'
    }
}

const getMessageClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-700'
        case 'error': return 'text-red-700'
        case 'warning': return 'text-amber-700'
        case 'info': return 'text-blue-700'
        default: return 'text-emerald-700'
    }
}

const getCloseButtonClasses = (type) => {
    switch (type) {
        case 'success': return 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
        case 'error': return 'text-red-500 hover:text-red-700 hover:bg-red-50'
        case 'warning': return 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
        case 'info': return 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
        default: return 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
    }
}

const getProgressBarClasses = (type) => {
    switch (type) {
        case 'success': return 'bg-gradient-to-r from-emerald-500 to-emerald-600'
        case 'error': return 'bg-gradient-to-r from-red-500 to-red-600'
        case 'warning': return 'bg-gradient-to-r from-amber-500 to-amber-600'
        case 'info': return 'bg-gradient-to-r from-blue-500 to-blue-600'
        default: return 'bg-gradient-to-r from-emerald-500 to-emerald-600'
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
    transform: translateY(-20px) scale(0.9);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
}

.notification-move {
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Mobile-first responsive animations */
@media (min-width: 640px) {
    .notification-enter-from {
        opacity: 0;
        transform: translateX(100%) scale(0.8);
    }
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

/* Enhanced mobile-friendly animations */
.notification-card {
    animation: slideInBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideInBounce {
    0% {
        opacity: 0;
        transform: translateY(-20px) scale(0.9);
    }

    60% {
        opacity: 1;
        transform: translateY(-2px) scale(1.02);
    }

    100% {
        opacity: 1;
        transform: translateY(0px) scale(1);
    }
}

/* Desktop-specific slide animation */
@media (min-width: 640px) {
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
}

/* Enhanced hover effects with mobile considerations */
.notification-card:hover {
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.15);
}

/* Touch-friendly styling for mobile */
@media (max-width: 639px) {
    .notification-card {
        /* Slightly reduce hover effects on mobile */
        transition: all 0.2s ease-out;
    }

    .notification-card:active {
        transform: scale(0.98);
    }
}

/* Improved backdrop blur support */
@supports (backdrop-filter: blur(10px)) {
    .notification-card {
        backdrop-filter: blur(10px);
        background-color: rgba(255, 255, 255, 0.9);
    }
}

/* Ensure good contrast and readability */
.notification-card {
    border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Focus states for accessibility */
.notification-card button:focus {
    outline: 2px solid #10b981;
    outline-offset: 2px;
}
</style>
