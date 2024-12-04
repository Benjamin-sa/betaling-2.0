<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      
      <h1 class="mt-4 text-2xl font-extrabold text-gray-900">
        Bedankt voor je bestelling!
      </h1>
      
      <p class="mt-2 text-gray-600">
        Je bestelling is succesvol verwerkt en je ontvangt spoedig een bevestigingsmail.
      </p>
      
      <div class="mt-8 space-y-4">
        <router-link
          to="/orders"
          class="block w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Bekijk je bestellingen
        </router-link>
        
        <router-link
          to="/"
          class="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Terug naar de homepagina
        </router-link>
      </div>
    </div>
  </div>
</template>