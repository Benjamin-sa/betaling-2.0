<template>
  <div v-if="images.length > 0" class="image-preview-container">
    <!-- Main Display Area -->
    <div class="relative bg-gray-50 rounded-xl overflow-hidden shadow-inner">
      <!-- Main Image Display -->
      <div class="aspect-w-16 aspect-h-9 sm:aspect-w-4 sm:aspect-h-3">
        <img 
          :src="selectedImage" 
          :alt="`Product afbeelding ${selectedIndex + 1}`"
          class="w-full h-full object-cover transition-all duration-300"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>

      <!-- Image Counter -->
      <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
        {{ selectedIndex + 1 }} / {{ images.length }}
      </div>

      <!-- Navigation Arrows (only show if multiple images) -->
      <template v-if="images.length > 1">
        <button 
          @click="previousImage" 
          class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
          :disabled="selectedIndex === 0"
          :class="{ 'opacity-50 cursor-not-allowed': selectedIndex === 0 }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          @click="nextImage" 
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
          :disabled="selectedIndex === images.length - 1"
          :class="{ 'opacity-50 cursor-not-allowed': selectedIndex === images.length - 1 }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </template>

      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Thumbnail Strip (only show if multiple images) -->
    <div v-if="images.length > 1" class="flex gap-2 mt-4 pb-2 overflow-x-auto scrollbar-hide">
      <button
        v-for="(image, index) in images"
        :key="index"
        @click="selectImage(index)"
        class="flex-shrink-0 relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-105"
        :class="[
          selectedIndex === index 
            ? 'ring-2 ring-primary shadow-lg' 
            : 'hover:ring-2 hover:ring-primary/50'
        ]"
      >
        <div class="w-16 h-16 sm:w-20 sm:h-20">
          <img 
            :src="image" 
            :alt="`Thumbnail ${index + 1}`"
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Active Indicator -->
        <div 
          v-if="selectedIndex === index" 
          class="absolute inset-0 bg-primary/20 flex items-center justify-center"
        >
          <div class="w-3 h-3 bg-primary rounded-full shadow-lg"></div>
        </div>
      </button>
    </div>

    <!-- Image Actions -->
    <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
      <!-- Image Info -->
      <div class="text-sm text-gray-500">
        <span v-if="images.length === 1">1 afbeelding</span>
        <span v-else>{{ images.length }} afbeeldingen</span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <!-- View Full Size -->
        <button
          @click="openFullscreen"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Bekijk volledig scherm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <span class="hidden sm:inline">Vergroten</span>
        </button>

        <!-- Remove Image (if removable) -->
        <button
          v-if="removable"
          @click="removeCurrentImage"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-error hover:bg-error-bg rounded-lg transition-colors duration-200"
          title="Afbeelding verwijderen"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="hidden sm:inline">Verwijderen</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
    <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <p class="text-gray-500 text-sm">Geen afbeeldingen beschikbaar</p>
  </div>

  <!-- Fullscreen Modal -->
  <Teleport to="body">
    <div 
      v-if="showFullscreen" 
      class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      @click="closeFullscreen"
    >
      <div class="relative max-w-7xl max-h-full">
        <!-- Close Button -->
        <button
          @click="closeFullscreen"
          class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Fullscreen Image -->
        <img 
          :src="selectedImage" 
          :alt="`Fullscreen afbeelding ${selectedIndex + 1}`"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />

        <!-- Navigation in Fullscreen -->
        <template v-if="images.length > 1">
          <button 
            @click.stop="previousImage" 
            class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
            :disabled="selectedIndex === 0"
            :class="{ 'opacity-50 cursor-not-allowed': selectedIndex === 0 }"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            @click.stop="nextImage" 
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
            :disabled="selectedIndex === images.length - 1"
            :class="{ 'opacity-50 cursor-not-allowed': selectedIndex === images.length - 1 }"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </template>

        <!-- Image Counter in Fullscreen -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          {{ selectedIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
    validator: (images) => images.every(img => typeof img === 'string')
  },
  removable: {
    type: Boolean,
    default: false
  },
  defaultIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['remove-image', 'image-selected']);

const selectedIndex = ref(props.defaultIndex);
const loading = ref(false);
const showFullscreen = ref(false);

const selectedImage = computed(() => {
  return props.images[selectedIndex.value] || null;
});

// Watch for images prop changes to reset selection if needed
watch(() => props.images, (newImages) => {
  if (selectedIndex.value >= newImages.length) {
    selectedIndex.value = Math.max(0, newImages.length - 1);
  }
}, { immediate: true });

// Watch for defaultIndex changes
watch(() => props.defaultIndex, (newIndex) => {
  if (newIndex >= 0 && newIndex < props.images.length) {
    selectedIndex.value = newIndex;
  }
});

const selectImage = (index) => {
  if (index >= 0 && index < props.images.length) {
    selectedIndex.value = index;
    emit('image-selected', index);
  }
};

const previousImage = () => {
  if (selectedIndex.value > 0) {
    selectImage(selectedIndex.value - 1);
  }
};

const nextImage = () => {
  if (selectedIndex.value < props.images.length - 1) {
    selectImage(selectedIndex.value + 1);
  }
};

const removeCurrentImage = () => {
  emit('remove-image', selectedIndex.value);
  // Adjust selection after removal
  if (selectedIndex.value >= props.images.length - 1) {
    selectedIndex.value = Math.max(0, props.images.length - 2);
  }
};

const openFullscreen = () => {
  showFullscreen.value = true;
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
};

const closeFullscreen = () => {
  showFullscreen.value = false;
  // Restore body scroll
  document.body.style.overflow = '';
};

const handleImageLoad = () => {
  loading.value = false;
};

const handleImageError = () => {
  loading.value = false;
  console.warn('Failed to load image:', selectedImage.value);
};

// Keyboard navigation
const handleKeydown = (event) => {
  if (showFullscreen.value) {
    switch (event.key) {
      case 'Escape':
        closeFullscreen();
        break;
      case 'ArrowLeft':
        previousImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  }
};

// Add keyboard listener when component mounts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown);
}

// Cleanup
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
  // Ensure body scroll is restored
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Hide scrollbar for webkit browsers */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Aspect ratio utility classes (if not using Tailwind CSS aspect-ratio plugin) */
.aspect-w-16 {
  position: relative;
  padding-bottom: calc(9 / 16 * 100%);
}

.aspect-w-4 {
  position: relative;
  padding-bottom: calc(3 / 4 * 100%);
}

.aspect-w-16 > img,
.aspect-w-4 > img {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

@media (min-width: 640px) {
  .aspect-w-16 {
    padding-bottom: calc(3 / 4 * 100%);
  }
}
</style>
