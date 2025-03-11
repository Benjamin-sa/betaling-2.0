<template>
  <div class="border-b pb-4 mb-4">
    <h2 class="text-xl sm:text-2xl font-semibold text-primary mb-4">Scout Management</h2>
    <div class="overflow-x-auto">
      <nav class="flex flex-wrap gap-2">
        <router-link 
          to="/admin/scout-management/materialen" 
          class="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          :class="{ 'bg-primary text-white': isActive('materialen') }"
        >
          Materialen
        </router-link>
        <router-link 
          to="/admin/scout-management/weien" 
          class="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          :class="{ 'bg-primary text-white': isActive('weien') }"
        >
          Weien
        </router-link>
        <router-link 
          to="/admin/scout-management/recepten" 
          class="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          :class="{ 'bg-primary text-white': isActive('recepten') }"
        >
          Recepten
        </router-link>
        <router-link
          to="/admin/scout-management/camp-planning"
          class="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          :class="$route.path.includes('/admin/scout-management/camp-planning') ? 
            'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          Kamp Planning
        </router-link>
        <router-link
          to="/admin/scout-management/leden"
          class="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          :class="$route.path.includes('/admin/scout-management/leden') ? 
            'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'"
        >
          Leden Beheer
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const isActive = (pathFragment) => {
  return route.path.includes(`/admin/scout-management/${pathFragment}`);
};
</script>
