<template>
  <BaseModal
    v-model="modalOpen"
    title="Leden importeren via CSV"
    confirm-text="Importeren"
    :confirm-disabled="!isFileValid || isImporting"
    @confirm="importCsv"
    @cancel="closeModal"
  >
    <div class="space-y-6">
      <!-- Introduction and instructions -->
      <div class="bg-blue-50 p-4 rounded">
        <h3 class="text-blue-800 font-medium mb-2">Instructies</h3>
        <p class="text-blue-700 text-sm mb-3">
          Upload een CSV-bestand met de ledendata. Het bestand moet de volgende kolommen bevatten:
        </p>
        <ul class="text-blue-700 text-sm list-disc pl-5 mb-2">
          <li>Voornaam (verplicht)</li>
          <li>Achternaam (verplicht)</li>
          <li>Geboortedatum (formaat: YYYY-MM-DD)</li>
          <li>Allergieën</li>
          <li>Dieetwensen</li>
          <li>Tak (Kapoenen, Welpen, JongVerkenners, Verkenners, Jin)</li>
          <li>Telefoonnummer</li>
        </ul>
        <button
          @click="downloadSampleCsv"
          class="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Download voorbeeldbestand
        </button>
      </div>

      <!-- File upload area -->
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        :class="{ 'border-red-500': fileError }"
        @click="triggerFileInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onFileDrop"
        :style="{ background: isDragging ? '#f3f4f6' : 'transparent' }"
      >
        <input
          type="file"
          ref="fileInput"
          accept=".csv"
          class="hidden"
          @change="onFileSelected"
        >
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        
        <span v-if="!selectedFile" class="text-gray-500">
          Sleep een CSV-bestand hierheen of <span class="text-primary font-medium">klik om te bladeren</span>
        </span>
        <span v-else class="text-gray-800 font-medium">
          {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          <button @click.stop="clearFile" class="ml-2 text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <p v-if="fileError" class="text-red-500 mt-2 text-sm">{{ fileError }}</p>
      </div>

      <!-- Preview section -->
      <div v-if="preview.length > 0 && !isImporting" class="border rounded-lg overflow-hidden">
        <h3 class="bg-gray-50 font-medium p-3 border-b">Voorbeeld (eerste 5 rijen)</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="(header, i) in csvHeaders" :key="i" class="px-3 py-2 text-left text-gray-600">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(row, i) in preview" :key="i">
                <td v-for="(value, j) in row" :key="j" class="px-3 py-2 whitespace-nowrap">
                  {{ value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Column Mapping UI (New section) -->
      <div v-if="preview.length > 0 && showColumnMapping && !isImporting" class="border rounded-lg overflow-hidden mt-4">
        <h3 class="bg-gray-50 font-medium p-3 border-b">Kolom Toewijzing</h3>
        <p class="p-3 text-sm text-gray-600">
          Wijs elke kolom uit je bestand toe aan het juiste veld:
        </p>
        <div class="p-3 space-y-3">
          <div v-for="(field, index) in requiredMapping" :key="field.target" class="flex items-center gap-3">
            <label :class="{'text-red-600 font-medium': field.required}" class="w-1/3">
              {{ field.label }}{{ field.required ? ' *' : '' }}:
            </label>
            <select 
              v-model="columnMapping[field.target]" 
              class="form-select w-2/3 border rounded py-1 px-2"
              :class="{'border-red-500': field.required && !columnMapping[field.target]}"
            >
              <option value="">-- Selecteer kolom --</option>
              <option v-for="header in csvHeaders" :key="header" :value="header">
                {{ header }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Processing Options (New section) -->
      <div v-if="preview.length > 0 && !isImporting" class="border rounded-lg p-4 mt-4">
        <h3 class="font-medium mb-2">Verwerking Opties</h3>
        <div class="flex items-center mb-3">
          <input type="checkbox" id="useBulkImport" v-model="useBulkImport" class="mr-2">
          <label for="useBulkImport">
            Bulk importeren (aanbevolen voor grote bestanden)
          </label>
          <span class="ml-2 text-gray-500 text-sm">
            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="tooltip">Verwerkt alle leden in één keer, sneller maar toont minder gedetailleerde voortgang</span>
          </span>
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="skipExisting" v-model="skipExisting" class="mr-2">
          <label for="skipExisting">
            Sla bestaande leden over (controleert op dubbele voornaam+achternaam)
          </label>
        </div>
      </div>

      <!-- Progress section -->
      <div v-if="isImporting" class="space-y-3">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-primary h-2.5 rounded-full transition-all duration-300" 
            :style="{ width: `${importProgress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-600">
          {{ importedCount }} van {{ parsedData.length }} leden verwerkt...
        </p>
      </div>

      <!-- Results section -->
      <div v-if="importResults.success > 0 || importResults.failed > 0" class="space-y-2">
        <div class="flex justify-between">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm">{{ importResults.success }} leden geïmporteerd</span>
          </div>
          <div v-if="importResults.failed > 0" class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="text-sm">{{ importResults.failed }} leden mislukt</span>
          </div>
        </div>
        
        <div v-if="importErrors.length > 0" class="bg-red-50 p-3 rounded text-sm space-y-1">
          <p class="font-medium text-red-800">Fouten:</p>
          <ul class="list-disc pl-5 text-red-700">
            <li v-for="(error, i) in importErrors.slice(0, 5)" :key="i">
              {{ error }}
            </li>
            <li v-if="importErrors.length > 5">En {{ importErrors.length - 5 }} andere fouten</li>
          </ul>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { apiClient } from '../../services/api';
import BaseModal from '../ui/BaseModal.vue';
import Papa from 'papaparse';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'import-success']);

const modalOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// File handling
const fileInput = ref(null);
const selectedFile = ref(null);
const fileError = ref('');
const isDragging = ref(false);
const isImporting = ref(false);

// CSV data
const parsedData = ref([]);
const preview = ref([]);
const csvHeaders = ref([]);
const importProgress = ref(0);
const importedCount = ref(0);
const importResults = ref({ success: 0, failed: 0 });
const importErrors = ref([]);

// Required columns
const requiredColumns = ['Voornaam', 'Achternaam'];
const validTakken = ['Kapoenen', 'Welpen', 'JongVerkenners', 'Verkenners', 'Jin', ''];

// Takken mapping for normalization
const takkenMapping = {
  // Kapoenen variations
  'kapoenen': 'Kapoenen',
  'kapoentjes': 'Kapoenen',
  'kap': 'Kapoenen',
  'KAPOENEN': 'Kapoenen',
  
  // Welpen variations
  'welpen': 'Welpen',
  'welp': 'Welpen',
  'WELPEN': 'Welpen',
  'KABOUTERS/WELPEN': 'Welpen',
  'KABOUTERS': 'Welpen',
  
  // JongVerkenners variations
  'jongverkenners': 'JongVerkenners',
  'jongverkenner': 'JongVerkenners',
  'jong verkenners': 'JongVerkenners',
  'jong verkenner': 'JongVerkenners',
  'jv': 'JongVerkenners',
  'jonggivers': 'JongVerkenners',
  'jonggiver': 'JongVerkenners',
  'jong givers': 'JongVerkenners',
  'jong giver': 'JongVerkenners',
  'JONGVERKENNERS': 'JongVerkenners',
  'JONGGIDSEN/JONGVERKENNERS': 'JongVerkenners',
  'JONGGIDSEN': 'JongVerkenners',
  
  // Verkenners variations
  'verkenner': 'Verkenners',
  'verkenners': 'Verkenners',
  'givers': 'Verkenners',
  'giver': 'Verkenners',
  'vk': 'Verkenners',
  'VERKENNERS': 'Verkenners',
  'GIDSEN/VERKENNERS': 'Verkenners',
  'GIDSEN': 'Verkenners',
  
  // Jin variations
  'jin': 'Jin',
  'jins': 'Jin',
  'JIN': 'Jin'
};

// Normalize tak name - improved to handle case-insensitivity better
const normalizeTak = (tak) => {
  if (!tak) return '';
  
  // First try exact match with case-insensitivity
  const exactMatchKey = Object.keys(takkenMapping).find(
    key => key.toLowerCase() === tak.toLowerCase()
  );
  
  if (exactMatchKey) {
    return takkenMapping[exactMatchKey];
  }
  
  // If no exact match, try the old fallback
  const normalized = takkenMapping[tak.toLowerCase()];
  if (normalized) return normalized;
  
  // Special handling for the problematic formats seen in errors
  if (tak.includes('/')) {
    const parts = tak.split('/');
    for (const part of parts) {
      const normalized = normalizeTak(part.trim()); // Recursively try each part
      if (validTakken.includes(normalized)) {
        return normalized;
      }
    }
  }
  
  return tak; // Return original if no match found
};

// Function to check if a tak is valid or can be normalized to a valid tak
const isValidTak = (tak) => {
  if (!tak) return true; // Empty is valid
  if (validTakken.includes(tak)) return true;
  
  const normalizedTak = normalizeTak(tak);
  return validTakken.includes(normalizedTak);
};

// Column mapping
const showColumnMapping = ref(false);
const columnMapping = ref({
  Voornaam: '',
  Achternaam: '',
  Geboortedatum: '',
  Allergieën: '',
  Dieetwensen: '',
  Tak: '',
  Telefoonnummer: ''
});

const requiredMapping = [
  { target: 'Voornaam', label: 'Voornaam', required: true },
  { target: 'Achternaam', label: 'Achternaam', required: true },
  { target: 'Geboortedatum', label: 'Geboortedatum', required: false },
  { target: 'Allergieën', label: 'Allergieën', required: false },
  { target: 'Dieetwensen', label: 'Dieetwensen', required: false },
  { target: 'Tak', label: 'Tak', required: false },
  { target: 'Telefoonnummer', label: 'Telefoonnummer', required: false }
];

// Import settings
const useBulkImport = ref(true);
const skipExisting = ref(true);

const isFileValid = computed(() => {
  return selectedFile.value && !fileError.value && (!showColumnMapping.value || isMappingValid.value);
});

// Reset state when modal opens/closes
watch(modalOpen, (newValue) => {
  if (!newValue) {
    // Reset state when modal closes
    resetState();
  }
});

const resetState = () => {
  selectedFile.value = null;
  fileError.value = '';
  parsedData.value = [];
  preview.value = [];
  csvHeaders.value = [];
  isImporting.value = false;
  importProgress.value = 0;
  importedCount.value = 0;
  importResults.value = { success: 0, failed: 0 };
  importErrors.value = [];
  showColumnMapping.value = false;
  columnMapping.value = {
    Voornaam: '',
    Achternaam: '',
    Geboortedatum: '',
    Allergieën: '',
    Dieetwensen: '',
    Tak: '',
    Telefoonnummer: ''
  };
  useBulkImport.value = true;
  skipExisting.value = true;
};

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value.click();
};

// Handle file drop
const onFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    handleFile(file);
  }
};

// Handle file selection
const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
};

// Process the selected file
const handleFile = (file) => {
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    fileError.value = 'Alleen CSV-bestanden zijn toegestaan.';
    selectedFile.value = null;
    return;
  }

  if (file.size > 1024 * 1024 * 2) { // 2MB limit
    fileError.value = 'Bestand is te groot. Maximum grootte is 2MB.';
    selectedFile.value = null;
    return;
  }

  selectedFile.value = file;
  fileError.value = '';
  parseCsvFile(file);
};

// Clear selected file
const clearFile = () => {
  selectedFile.value = null;
  fileError.value = '';
  parsedData.value = [];
  preview.value = [];
  csvHeaders.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Parse CSV file
const parseCsvFile = (file) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        fileError.value = `CSV parsing error: ${results.errors[0].message}`;
        return;
      }
      
      // Store headers and attempt auto-mapping
      csvHeaders.value = results.meta.fields;
      
      // Auto-map columns based on header names
      autoMapColumns();
      
      // Show column mapping UI if needed
      const requiredMappingMissing = requiredColumns.some(col => !columnMapping.value[col]);
      showColumnMapping.value = requiredMappingMissing;

      // Store parsed data and create preview
      parsedData.value = results.data;
      preview.value = parsedData.value.slice(0, 5);
    },
    error: (error) => {
      fileError.value = `Fout bij het verwerken van het bestand: ${error.message}`;
    }
  });
};

// Auto-map columns based on headers
const autoMapColumns = () => {
  // Reset mapping
  Object.keys(columnMapping.value).forEach(key => {
    columnMapping.value[key] = '';
  });

  // Try to map columns automatically
  csvHeaders.value.forEach(header => {
    // Exact matches
    if (header in columnMapping.value) {
      columnMapping.value[header] = header;
      return;
    }
    
    // Handle common variations through simple normalization
    const normalizedHeader = header.toLowerCase().trim();
    
    if (normalizedHeader.includes('voornaam') || normalizedHeader.includes('first')) {
      columnMapping.value.Voornaam = header;
    } else if (normalizedHeader.includes('achternaam') || normalizedHeader.includes('last')) {
      columnMapping.value.Achternaam = header;
    } else if (normalizedHeader.includes('geboorte') || normalizedHeader.includes('birth')) {
      columnMapping.value.Geboortedatum = header;
    } else if (normalizedHeader.includes('allergie')) {
      columnMapping.value.Allergieën = header;
    } else if (normalizedHeader.includes('dieet') || normalizedHeader.includes('diet')) {
      columnMapping.value.Dieetwensen = header;
    } else if (normalizedHeader.includes('tak') || normalizedHeader.includes('group')) {
      columnMapping.value.Tak = header;
    } else if (normalizedHeader.includes('tel') || normalizedHeader.includes('phone')) {
      columnMapping.value.Telefoonnummer = header;
    }
  });
};

// Get mapped record
const getMappedRecord = (row) => {
  const mappedRecord = {};
  
  // Map fields according to the column mapping
  Object.entries(columnMapping.value).forEach(([targetField, sourceField]) => {
    if (sourceField && row[sourceField] !== undefined) {
      mappedRecord[targetField] = row[sourceField];
    } else {
      mappedRecord[targetField] = '';
    }
  });
  
  return mappedRecord;
};

// Check if mapping is valid
const isMappingValid = computed(() => {
  return requiredColumns.every(col => columnMapping.value[col]);
});

// Format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

// Download sample CSV
const downloadSampleCsv = () => {
  const headers = ['Voornaam', 'Achternaam', 'Geboortedatum', 'Allergieën', 'Dieetwensen', 'Tak', 'Telefoonnummer'];
  const sampleData = [
    ['Jan', 'Janssens', '2015-05-12', 'Noten', '', 'Kapoenen', '0470123456'],
    ['Marie', 'Peters', '2013-10-23', '', 'Vegetarisch', 'Welpen', '0471234567'],
    ['Tom', 'Willems', '2010-03-05', '', '', 'JongVerkenner', '']
  ];
  
  // Convert to CSV
  let csvContent = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'leden_voorbeeld.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Import CSV data
const importCsv = async () => {
  if (!parsedData.value.length) return;
  
  isImporting.value = true;
  importProgress.value = 0;
  importedCount.value = 0;
  importErrors.value = [];
  importResults.value = { success: 0, failed: 0 };
  
  try {
    if (useBulkImport.value) {
      await bulkImport();
    } else {
      await individualImport();
    }
  } catch (error) {
    console.error('Import failed:', error);
    importErrors.value.push(`Algemene fout: ${error.message}`);
  } finally {
    isImporting.value = false;
    if (importResults.value.success > 0) {
      emit('import-success', importResults.value.success);
      // Close modal after brief delay to show results
      setTimeout(() => {
        modalOpen.value = false;
      }, 3000);
    }
  }
};

// Bulk import method (new)
const bulkImport = async () => {
  // Map all records
  const mappedRecords = parsedData.value.map(row => getMappedRecord(row));
  
  // Validate all records
  const validRecords = [];
  
  for (const record of mappedRecords) {
    try {
      // Validate required fields
      if (!record.Voornaam || !record.Achternaam) {
        throw new Error(`Voor lid ${record.Voornaam || ''} ${record.Achternaam || ''}: Voornaam en achternaam zijn verplicht.`);
      }
      
      // Validate date format if present
      if (record.Geboortedatum && !/^\d{4}-\d{2}-\d{2}$/.test(record.Geboortedatum)) {
        throw new Error(`Voor lid ${record.Voornaam} ${record.Achternaam}: Ongeldige geboortedatum, gebruik YYYY-MM-DD formaat.`);
      }
      
      // Validate Tak if present
      if (record.Tak && !isValidTak(record.Tak)) {
        throw new Error(`Voor lid ${record.Voornaam} ${record.Achternaam}: Ongeldige tak "${record.Tak}". Gebruik Kapoenen, Welpen, JongVerkenners, Verkenners of Jin.`);
      }
      
      // Normalize tak name
      record.Tak = record.Tak ? normalizeTak(record.Tak) : '';
      
      // Add standard fields
      record.Is_Actief = true;
      record.Lidmaatschap_Datum = new Date().toISOString().split('T')[0];
      
      validRecords.push(record);
    } catch (error) {
      importResults.value.failed++;
      importErrors.value.push(error.message);
    }
  }
  
  // Update progress
  importProgress.value = 50;
  
  // Send bulk import request
  if (validRecords.length > 0) {
    try {
      const result = await apiClient.bulkCreateLeden(validRecords, skipExisting.value);
      importResults.value.success = result.created;
      
      if (result.skipped) {
        importErrors.value.push(`${result.skipped} leden overgeslagen omdat ze al bestaan.`);
      }
      
      if (result.failed) {
        importErrors.value.push(`${result.failed} leden konden niet worden geïmporteerd.`);
        importResults.value.failed += result.failed;
      }
    } catch (error) {
      importErrors.value.push(`Bulk import fout: ${error.message}`);
      importResults.value.failed += validRecords.length;
    }
  }
  
  importProgress.value = 100;
  importedCount.value = importResults.value.success;
};

// Individual import method (modified existing)
const individualImport = async () => {
  const total = parsedData.value.length;
  let processed = 0;
  
  for (const row of parsedData.value) {
    try {
      // Map the row according to the column mapping
      const mappedRecord = getMappedRecord(row);
      
      // Validate required fields
      if (!mappedRecord.Voornaam || !mappedRecord.Achternaam) {
        throw new Error(`Voor lid ${mappedRecord.Voornaam || ''} ${mappedRecord.Achternaam || ''}: Voornaam en achternaam zijn verplicht.`);
      }
      
      // Validate date format if present
      if (mappedRecord.Geboortedatum && !/^\d{4}-\d{2}-\d{2}$/.test(mappedRecord.Geboortedatum)) {
        throw new Error(`Voor lid ${mappedRecord.Voornaam} ${mappedRecord.Achternaam}: Ongeldige geboortedatum, gebruik YYYY-MM-DD formaat.`);
      }
      
      // Validate Tak if present
      if (mappedRecord.Tak && !isValidTak(mappedRecord.Tak)) {
        throw new Error(`Voor lid ${mappedRecord.Voornaam} ${mappedRecord.Achternaam}: Ongeldige tak "${mappedRecord.Tak}". Gebruik Kapoenen, Welpen, JongVerkenners, Verkenners of Jin.`);
      }
      
      // Normalize tak name
      const normalizedTak = mappedRecord.Tak ? normalizeTak(mappedRecord.Tak) : '';
      
      // Prepare data
      const lidData = {
        Voornaam: mappedRecord.Voornaam,
        Achternaam: mappedRecord.Achternaam,
        Geboortedatum: mappedRecord.Geboortedatum || '',
        Allergieën: mappedRecord.Allergieën || '',
        Dieetwensen: mappedRecord.Dieetwensen || '',
        Tak: normalizedTak,
        Telefoonnummer: mappedRecord.Telefoonnummer || '',
        Is_Actief: true,
        Lidmaatschap_Datum: new Date().toISOString().split('T')[0]
      };
      
      // Check if member exists (if skipExisting is enabled)
      if (skipExisting.value) {
        const existingLeden = await apiClient.getLeden({ 
          search: `${lidData.Voornaam} ${lidData.Achternaam}`
        });
        
        const exists = existingLeden.some(lid => 
          lid.Voornaam.toLowerCase() === lidData.Voornaam.toLowerCase() && 
          lid.Achternaam.toLowerCase() === lidData.Achternaam.toLowerCase()
        );
        
        if (exists) {
          // Skip this member
          importErrors.value.push(`Lid ${lidData.Voornaam} ${lidData.Achternaam} bestaat al en wordt overgeslagen.`);
          processed++;
          importedCount.value = processed;
          importProgress.value = Math.round((processed / total) * 100);
          continue;
        }
      }
      
      // Create the member
      await apiClient.createLid(lidData);
      importResults.value.success++;
    } catch (error) {
      importResults.value.failed++;
      const errorMessage = error.message || `Onbekende fout bij lid ${row.Voornaam || ''} ${row.Achternaam || ''}`;
      importErrors.value.push(errorMessage);
      console.error('Error importing member:', error);
    } finally {
      processed++;
      importedCount.value = processed;
      importProgress.value = Math.round((processed / total) * 100);
    }
  }
};

// Add close modal function
const closeModal = () => {
  modalOpen.value = false;
};
</script>

<style scoped>
.tooltip {
  @apply invisible absolute bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-10 ml-2;
  width: 250px;
}

[class*="tooltip"]:hover:after {
  @apply visible;
}
</style>
