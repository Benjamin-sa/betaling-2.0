<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-background">
    <div class="bg-cardBackground p-8 rounded-lg shadow-lg text-center">
      <h1 class="text-3xl font-bold text-primary mb-4">Bedankt voor je aankoop!</h1>
      <p class="text-text mb-6">Je bestelling is succesvol verwerkt.</p>
      <router-link to="/" class="inline-block bg-primary text-white px-6 py-3 rounded hover:bg-green-700 transition duration-300">
        Ga naar de homepagina
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Geen extra scripts nodig voor deze eenvoudige component
</script>