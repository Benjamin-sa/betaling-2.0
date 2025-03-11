<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        :class="[
          'bg-white rounded-lg shadow-lg overflow-hidden',
          sizeClasses,
          'max-h-[90vh] flex flex-col'
        ]"
        @click.stop
      >
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-medium">{{ title }}</h3>
          <button 
            @click="close" 
            class="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-4 overflow-y-auto flex-grow">
          <slot></slot>
        </div>
        
        <!-- Footer -->
        <div v-if="!hideFooter" class="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <slot name="footer">
            <button
              v-if="showCancelButton"
              @click="close"
              type="button"
              class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              {{ cancelText }}
            </button>
            <button
              v-if="showConfirmButton"
              @click="confirm"
              type="button"
              :class="[
                'px-4 py-2 rounded text-white',
                confirmButtonClass || 'bg-primary hover:bg-green-700'
              ]"
            >
              {{ confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
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
    default: 'Modal'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  hideFooter: {
    type: Boolean,
    default: false
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  confirmButtonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-lg',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
    full: 'w-full max-w-[90vw]'
  };
  return sizes[props.size] || sizes.md;
});

const close = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
};
</script>
