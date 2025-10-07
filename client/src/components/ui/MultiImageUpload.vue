<template>
  <div class="multi-image-upload">
    <!-- Upload Area -->
    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 mb-2">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </label>

      <!-- Drop Zone -->
      <div @drop.prevent="handleDrop" @dragover.prevent="isDragOver = true" @dragenter.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        class="relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer" :class="[
          isDragOver
            ? 'border-primary bg-primary/5 scale-102'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        ]">
        <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileChange"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" :disabled="disabled" />

        <div class="px-6 py-8 text-center">
          <!-- Upload Icon -->
          <div class="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full"
            :class="isDragOver ? 'bg-primary/10' : 'bg-gray-100'">
            <svg class="w-6 h-6 transition-colors duration-200" :class="isDragOver ? 'text-primary' : 'text-gray-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <!-- Upload Text -->
          <div>
            <p class="text-sm font-medium" :class="isDragOver ? 'text-primary' : 'text-gray-900'">
              <span v-if="isDragOver">Laat bestanden los om te uploaden</span>
              <span v-else>Sleep afbeeldingen hier of klik om te selecteren</span>
            </p>
            <p class="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP tot {{ maxSizeMB }}MB per bestand
              <span v-if="maxImages > 1"> • Maximaal {{ maxImages }} afbeeldingen</span>
            </p>
          </div>

          <!-- Current Count -->
          <div v-if="modelValue.length > 0" class="mt-3">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {{ modelValue.length }} van {{ maxImages }} afbeelding{{ modelValue.length !== 1 ? 'en' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <p v-if="errorMessage" class="mt-2 text-sm text-error">
        {{ errorMessage }}
      </p>

      <!-- Help Text -->
      <p v-else-if="helpText" class="mt-2 text-sm text-gray-500">
        {{ helpText }}
      </p>
    </div>

    <!-- Preview Grid -->
    <div v-if="previewImages.length > 0" class="space-y-4">
      <h4 class="text-sm font-semibold text-gray-700">Geselecteerde afbeeldingen</h4>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="(image, index) in previewImages" :key="index"
          class="relative group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary transition-all duration-200 hover:shadow-lg">
          <!-- Image Preview -->
          <div class="aspect-square relative">
            <img :src="image.url" :alt="`Preview ${index + 1}`" class="w-full h-full object-cover" />

            <!-- Loading Overlay -->
            <div v-if="image.loading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
              <svg class="w-6 h-6 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
            </div>

            <!-- Error Overlay -->
            <div v-if="image.error" class="absolute inset-0 bg-error/10 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-6 h-6 text-error mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-error">Fout</p>
              </div>
            </div>
          </div>

          <!-- Image Actions -->
          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div class="flex gap-2">
              <!-- View Button -->
              <button @click="viewImage(index)"
                class="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200"
                title="Bekijken">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              <!-- Remove Button -->
              <button @click="removeImage(index)"
                class="p-2 bg-error/80 backdrop-blur-sm text-white rounded-full hover:bg-error transition-colors duration-200"
                title="Verwijderen">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Image Info -->
          <div class="p-2 border-t border-gray-100">
            <p class="text-xs text-gray-600 truncate" :title="image.name">
              {{ image.name }}
            </p>
            <p class="text-xs text-gray-400">
              {{ formatFileSize(image.size) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div v-if="previewImages.length > 0" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
      <div class="text-sm text-gray-500">
        {{ previewImages.length }} afbeelding{{ previewImages.length !== 1 ? 'en' : '' }} geselecteerd
      </div>

      <div class="flex gap-2">
        <button @click="clearAll"
          class="px-3 py-1.5 text-sm text-gray-600 hover:text-error hover:bg-error/5 rounded-lg transition-colors duration-200">
          Alles wissen
        </button>

        <button @click="selectMoreImages" :disabled="previewImages.length >= maxImages"
          class="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          Meer toevoegen
        </button>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <Teleport to="body">
      <div v-if="showViewer"
        class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        @click="closeViewer">
        <div class="relative max-w-4xl max-h-full">
          <button @click="closeViewer"
            class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img v-if="selectedImageForView" :src="selectedImageForView.url" :alt="selectedImageForView.name"
            class="max-w-full max-h-full object-contain" @click.stop />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: 'Afbeeldingen'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxImages: {
    type: Number,
    default: 5
  },
  maxSizeMB: {
    type: Number,
    default: 5
  },
  helpText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'error']);

const fileInput = ref(null);
const isDragOver = ref(false);
const errorMessage = ref('');
const showViewer = ref(false);
const selectedImageForView = ref(null);

const previewImages = ref([]);

// Create preview URLs for uploaded files
const createPreviewImages = (files) => {
  return files.map((file, index) => ({
    file,
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    loading: false,
    error: false,
    id: `${Date.now()}-${index}`
  }));
};

// Initialize preview images from modelValue
watch(() => props.modelValue, (newFiles) => {
  // Clean up old URLs
  previewImages.value.forEach(img => {
    if (img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }
  });

  previewImages.value = newFiles.length > 0 ? createPreviewImages(newFiles) : [];
}, { immediate: true });

const validateFile = (file) => {
  const maxSize = props.maxSizeMB * 1024 * 1024; // Convert to bytes

  if (!file.type.startsWith('image/')) {
    return 'Alleen afbeeldingsbestanden zijn toegestaan';
  }

  if (file.size > maxSize) {
    return `Bestand is te groot. Maximaal ${props.maxSizeMB}MB toegestaan`;
  }

  return null;
};

const validateFiles = (files) => {
  const currentCount = props.modelValue.length;
  const newCount = files.length;

  if (currentCount + newCount > props.maxImages) {
    return `Je kunt maximaal ${props.maxImages} afbeeldingen uploaden. Je hebt er al ${currentCount}.`;
  }

  for (const file of files) {
    const fileError = validateFile(file);
    if (fileError) {
      return fileError;
    }
  }

  return null;
};

const addFiles = (files) => {
  errorMessage.value = '';

  const validationError = validateFiles(files);
  if (validationError) {
    errorMessage.value = validationError;
    emit('error', validationError);
    return;
  }

  const newFiles = [...props.modelValue, ...files];
  emit('update:modelValue', newFiles);
};

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    addFiles(files);
  }
};

const handleDrop = (event) => {
  isDragOver.value = false;
  const files = Array.from(event.dataTransfer.files);
  if (files.length > 0) {
    addFiles(files);
  }
};

const removeImage = (index) => {
  const newFiles = [...props.modelValue];
  newFiles.splice(index, 1);
  emit('update:modelValue', newFiles);
  errorMessage.value = '';
};

const clearAll = () => {
  emit('update:modelValue', []);
  errorMessage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const selectMoreImages = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const viewImage = (index) => {
  selectedImageForView.value = previewImages.value[index];
  showViewer.value = true;
  document.body.style.overflow = 'hidden';
};

const closeViewer = () => {
  showViewer.value = false;
  selectedImageForView.value = null;
  document.body.style.overflow = '';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Cleanup on unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  // Clean up blob URLs
  previewImages.value.forEach(img => {
    if (img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }
  });

  // Restore body scroll
  document.body.style.overflow = '';
});
</script>

<style scoped>
.scale-102 {
  transform: scale(1.02);
}
</style>
