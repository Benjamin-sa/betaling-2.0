<template>
  <div
    class="group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div class="relative aspect-w-4 aspect-h-3">
      <img v-if="product.image" :src="product.image" :alt="product.name" @error="handleImageError"
        class="w-full h-full object-cover transform transition-transform group-hover:scale-105" />
      <div v-else
        class="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center p-4">
        <span class="text-2xl font-bold text-primary/80 text-center">{{ product.name }}</span>
        <span class="mt-2 text-sm text-gray-600 text-center">€{{ product.price.toFixed(2) }}</span>
      </div>
    </div>

    <div class="p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h3>
      <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>

      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold text-primary">€{{ product.price.toFixed(2) }}</span>
        <div v-if="!preview" class="flex items-center space-x-2">
          <button @click="decreaseQuantity" class="p-1 rounded-full hover:bg-gray-100" :disabled="quantity <= 0">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>

          <input type="number" :value="quantity" @input="updateQuantity" min="0"
            class="w-16 text-center border-gray-200 rounded-md focus:ring-primary focus:border-primary" />

          <button @click="increaseQuantity" class="p-1 rounded-full hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        <div v-else class="text-sm text-gray-500 font-medium">
          Preview
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  preview: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:quantity', 'image-error'])

const handleImageError = () => {
  emit('image-error', props.product)
}

const increaseQuantity = () => {
  emit('update:quantity', props.product.id, props.quantity + 1)
}

const decreaseQuantity = () => {
  if (props.quantity > 0) {
    emit('update:quantity', props.product.id, props.quantity - 1)
  }
}

const updateQuantity = (event) => {
  const newQuantity = Math.max(0, parseInt(event.target.value) || 0)
  emit('update:quantity', props.product.id, newQuantity)
}
</script>
