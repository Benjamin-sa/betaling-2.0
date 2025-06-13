<template>
    <BaseModal :model-value="modelValue" :title="title" :size="size" :close-on-backdrop="closeOnBackdrop"
        show-cancel-button show-confirm-button :cancel-text="cancelText" :confirm-text="confirmText"
        :confirm-disabled="loading" :confirm-button-class="confirmButtonClass"
        @update:model-value="$emit('update:modelValue', $event)" @confirm="handleConfirm" @cancel="handleCancel"
        @close="handleClose">
        <!-- Icon slot -->
        <template #icon>
            <div :class="iconContainerClass">
                <!-- Warning/Danger Icon -->
                <svg v-if="type === 'warning' || type === 'danger'" :class="iconClass" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>

                <!-- Info Icon -->
                <svg v-else-if="type === 'info'" :class="iconClass" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>

                <!-- Success Icon -->
                <svg v-else-if="type === 'success'" :class="iconClass" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </template>

        <!-- Message content -->
        <div class="mt-3 text-center sm:mt-0 sm:text-left">
            <div class="mt-2">
                <p class="text-sm text-gray-500">
                    {{ message }}
                </p>

                <!-- Additional content slot -->
                <div v-if="$slots.default" class="mt-4">
                    <slot />
                </div>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: 'Bevestiging'
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'warning',
        validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
    },
    size: {
        type: String,
        default: 'sm'
    },
    cancelText: {
        type: String,
        default: 'Annuleren'
    },
    confirmText: {
        type: String,
        default: 'Bevestigen'
    },
    loading: {
        type: Boolean,
        default: false
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close']);

// Icon configuration based on type
const iconConfig = computed(() => {
    const configs = {
        warning: {
            containerClass: 'bg-yellow-100',
            iconClass: 'w-6 h-6 text-yellow-600'
        },
        danger: {
            containerClass: 'bg-red-100',
            iconClass: 'w-6 h-6 text-red-600'
        },
        info: {
            containerClass: 'bg-blue-100',
            iconClass: 'w-6 h-6 text-blue-600'
        },
        success: {
            containerClass: 'bg-green-100',
            iconClass: 'w-6 h-6 text-green-600'
        }
    };
    return configs[props.type] || configs.warning;
});

const iconContainerClass = computed(() =>
    `mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconConfig.value.containerClass}`
);

const iconClass = computed(() => iconConfig.value.iconClass);

const confirmButtonClass = computed(() => {
    const classes = {
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
    };
    return `${classes[props.type]} text-white focus:outline-none focus:ring-2 focus:ring-offset-2`;
});

const handleConfirm = () => {
    emit('confirm');
};

const handleCancel = () => {
    emit('cancel');
};

const handleClose = () => {
    emit('close');
};
</script>

<style scoped>
/* Ensure proper styling for SVG icons */
svg {
    display: block;
}
</style>
