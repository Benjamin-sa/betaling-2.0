<template>
    <Teleport to="body">
        <Transition name="modal" appear>
            <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
                <!-- Backdrop -->
                <div class="fixed inset-0 bg-black/50 transition-opacity" />

                <!-- Modal container -->
                <div class="flex min-h-screen items-center justify-center p-4">
                    <div :class="[
                        'relative bg-white rounded-lg shadow-xl transform transition-all',
                        sizeClasses,
                        'max-h-[90vh] flex flex-col'
                    ]" @click.stop>
                        <!-- Header -->
                        <div v-if="!hideHeader"
                            class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div class="flex items-center space-x-3">
                                <!-- Icon slot -->
                                <div v-if="$slots.icon" class="flex-shrink-0">
                                    <slot name="icon" />
                                </div>
                                <!-- Title -->
                                <h3 class="text-lg font-semibold text-gray-900">
                                    <slot name="title">{{ title }}</slot>
                                </h3>
                            </div>

                            <!-- Close button -->
                            <button v-if="showCloseButton" @click="close" type="button"
                                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="flex-1 overflow-y-auto px-6 py-4">
                            <slot />
                        </div>

                        <!-- Footer -->
                        <div v-if="!hideFooter && (showCancelButton || showConfirmButton || $slots.footer)"
                            class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <slot name="footer">
                                <div class="flex justify-end space-x-3">
                                    <button v-if="showCancelButton" @click="cancel" type="button" :class="[
                                        'px-4 py-2 border rounded-md text-sm font-medium transition-colors',
                                        cancelButtonClass || 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                    ]">
                                        {{ cancelText }}
                                    </button>
                                    <button v-if="showConfirmButton" @click="confirm" type="button"
                                        :disabled="confirmDisabled" :class="[
                                            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                            'disabled:opacity-50 disabled:cursor-not-allowed',
                                            confirmButtonClass || 'bg-primary text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                                        ]">
                                        {{ confirmText }}
                                    </button>
                                </div>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(value)
    },
    hideHeader: {
        type: Boolean,
        default: false
    },
    hideFooter: {
        type: Boolean,
        default: false
    },
    showCloseButton: {
        type: Boolean,
        default: true
    },
    showCancelButton: {
        type: Boolean,
        default: false
    },
    showConfirmButton: {
        type: Boolean,
        default: false
    },
    cancelText: {
        type: String,
        default: 'Annuleren'
    },
    confirmText: {
        type: String,
        default: 'Bevestigen'
    },
    confirmButtonClass: {
        type: String,
        default: ''
    },
    cancelButtonClass: {
        type: String,
        default: ''
    },
    confirmDisabled: {
        type: Boolean,
        default: false
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close']);

const sizeClasses = computed(() => {
    const sizes = {
        xs: 'w-full max-w-xs',
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-2xl',
        full: 'w-full max-w-[90vw] h-[90vh]'
    };
    return sizes[props.size] || sizes.md;
});

const close = () => {
    emit('update:modelValue', false);
    emit('close');
};

const cancel = () => {
    emit('cancel');
    close();
};

const confirm = () => {
    emit('confirm');
};

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        close();
    }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
    transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: scale(0.95) translateY(-20px);
}
</style>
