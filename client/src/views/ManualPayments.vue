<template>
  <div class="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
    <!-- Professional Alert System -->
    <div class="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
      <div class="flex items-start space-x-6">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <div class="border-b border-slate-200 pb-4 mb-4">
            <h3 class="text-lg font-medium text-slate-900 mb-1">
              Tijdelijke aanpassing betalingssysteem
            </h3>
            <p class="text-slate-600">
              Wegens een lopende verificatie van onze jeugdbeweging bij onze betalingsprovider maken we tijdelijk gebruik van overschrijvingen.
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-semibold text-slate-900 mb-2">Betaalproces</h4>
              <ol class="text-slate-600 list-decimal list-inside space-y-1.5">
                <li>Bevestig je bestelling via onderstaande knop</li>
                <li>Schrijf het exacte bedrag over naar de aangegeven rekening</li>
                <li>Gebruik de unieke mededeling bij je overschrijving</li>
                <li>Volg je bestelling op via "Mijn Bestellingen"</li>
              </ol>
            </div>

            <div class="bg-slate-100 rounded p-4 mt-4">
              <div class="flex items-start space-x-3">
                <svg class="h-5 w-5 text-slate-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-sm text-slate-700 font-medium">Hulp nodig?</p>
                  <p class="text-sm text-slate-600">
                    Contacteer ons via <a href="mailto:groepsleiding@lodlavki.be" class="text-primary hover:text-primary-dark underline">groepsleiding@lodlavki.be</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h1 class="text-xl sm:text-2xl font-bold mb-6">Manuele Betaling</h1>

    <!-- Order Summary -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Bestelling Overzicht</h2>
      <div class="space-y-4">
        <div v-for="item in orderItems" :key="item.id" class="flex justify-between">
          <div>
            <p class="font-medium">{{ item.name }}</p>
            <p class="text-sm text-gray-600">{{ item.quantity }}x €{{ formatPrice(item.price) }}</p>
          </div>
          <p class="font-medium">€{{ formatPrice(item.price * item.quantity) }}</p>
        </div>
        <div class="border-t pt-4">
          <div class="flex justify-between font-bold">
            <p>Totaal</p>
            <p>€{{ formatPrice(totalAmount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Slot Info if applicable -->
    <div v-if="timeSlot" class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-2">Geselecteerd Tijdslot</h2>
      <p>{{ timeSlot }}</p>
    </div>

    <!-- Enhanced Mobile-Friendly Bank Account Information -->
    <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <h2 class="text-lg sm:text-xl font-semibold mb-4">Betaalinstructies</h2>
      <div class="space-y-4">
        <!-- Amount Section -->
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">Te betalen:</span>
            <div class="flex items-center">
              <span class="mr-2 text-lg font-bold" id="amount">€{{ formatPrice(totalAmount) }}</span>
              <button @click="copyToClipboard('amount')" class="p-2 text-primary hover:text-primary-dark">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- IBAN Section -->
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="flex justify-between items-center">
            <span class="font-medium">IBAN:</span>
            <div class="flex items-center">
              <span class="mr-2 font-mono" id="iban">BE58 7845 3828 7479</span>
              <button @click="copyToClipboard('iban')" class="p-2 text-primary hover:text-primary-dark">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Reference Section with Email -->
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="flex justify-between items-center">
            <span class="font-medium">Mededeling:</span>
            <div class="flex items-center">
              <span class="mr-2 font-mono" id="reference">{{ orderReference }}</span>
              <button @click="copyToClipboard('reference')" class="p-2 text-primary hover:text-primary-dark">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-1">We gebruiken je email als referentie om de betaling te kunnen verifiëren</p>
        </div>

        <!-- Mobile Share Options -->
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <button 
            @click="shareDetails" 
            class="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90"
          >
            <i class="fas fa-share-alt"></i>
            Deel Details
          </button>
         
        </div>
      </div>
    </div>
    </div>

    <!-- Confirmation Button -->
    <button
      @click="handleConfirmOrder"
      :disabled="processing"
      class="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 disabled:bg-gray-400"
    >
      {{ processing ? 'Bezig met verwerken...' : 'Bevestig Bestelling' }}
    </button>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@/services/api';
import { getAuth } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const processing = ref(false);
const auth = getAuth();

const orderItems = ref([]);
const timeSlot = ref(null);
const orderReference = ref('');

// Simplified reference generation using just the email
const generateReference = () => {
  const user = auth.currentUser;
  if (user?.email) {
    // Simply clean the email of special characters and convert to uppercase
    return user.email
      .replace(/[^a-zA-Z0-9]/g, '')  // Remove special characters
      .toUpperCase();                 // Convert to uppercase for better readability
  }
  // Fallback if no email available
  return 'MANUAL-ORDER';
};

onMounted(() => {
  try {
    orderItems.value = JSON.parse(route.query.items || '[]');
    timeSlot.value = route.query.timeSlot || null;

    if (orderItems.value.length === 0) {
      router.push('/');
    }

    // Set reference using email
    orderReference.value = generateReference();
  } catch (error) {
    console.error('Error parsing order data:', error);
    router.push('/');
  }
});

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const formatPrice = (price) => {
  // Convert to number and handle invalid inputs
  const numPrice = Number(price);
  if (isNaN(numPrice)) {
    console.warn('Invalid price value:', price);
    return '0.00';
  }
  return numPrice.toFixed(2);
};

const handleConfirmOrder = async () => {
  try {
    processing.value = true;
    const response = await apiClient.createManualOrder(orderItems.value, timeSlot.value);

    // Redirect to success page or show confirmation
    router.push({
      name: 'success'
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    alert('Er is een fout opgetreden bij het verwerken van je bestelling.');
  } finally {
    processing.value = false;
  }
};


const shareText = computed(() => {
  const user = auth.currentUser;
  return `Betaalgegevens Scouts Lod Lavki:
Bedrag: €${formatPrice(totalAmount.value)}
IBAN: BE58 7845 3828 7479
Mededeling:
${user?.email ? `Email: ${user.email}` : ''}`;
});

const shareDetails = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Betaalgegevens Scouts Lod Lavki',
        text: shareText.value
      });
    } catch (err) {
      console.error('Error sharing:', err);
      fallbackCopy(shareText.value);
    }
  } else {
    fallbackCopy(shareText.value);
  }
};

const fallbackCopy = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('Alle gegevens gekopieerd naar klembord!'))
    .catch(err => console.error('Failed to copy:', err));
};

const copyToClipboard = async (elementId) => {
  const text = document.getElementById(elementId).textContent;
  try {
    await navigator.clipboard.writeText(text);
    // Use toast or subtle notification instead of alert
    const element = document.getElementById(elementId);
    element.classList.add('bg-green-100');
    setTimeout(() => element.classList.remove('bg-green-100'), 500);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<style scoped>
/* Improve touch targets on mobile */
button {
  min-height: 44px;
  min-width: 44px;
}

/* Smooth transitions */
.bg-green-100 {
  transition: background-color 0.2s ease;
}

/* Improved font rendering */
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
