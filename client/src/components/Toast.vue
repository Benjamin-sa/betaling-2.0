<template>
  <div
    v-if="show"
    class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white"
    :class="type === 'error' ? 'bg-red-500' : 'bg-green-500'"
  >
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: String,
  type: String
});
</script>
