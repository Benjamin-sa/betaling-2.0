<template>
    <div v-if="shiftId" class="mt-2">
        <div v-if="loading" class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">
            <svg class="w-3 h-3 inline mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Shift info laden...
        </div>
        <div v-else-if="shiftInfo"
            class="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md inline-block">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ shiftInfo.name }} ({{ shiftInfo.startTime }} - {{ shiftInfo.endTime }})
        </div>
        <div v-else class="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md inline-block">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Shift ID: {{ shiftId }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/services/api'

const props = defineProps({
    eventId: {
        type: String,
        required: true
    },
    shiftId: {
        type: String,
        required: true
    }
})

const shiftInfo = ref(null)
const loading = ref(false)

const fetchShiftInfo = async () => {
    if (!props.eventId || !props.shiftId || props.eventId.trim() === '' || props.shiftId.trim() === '') {
        return
    }

    try {
        loading.value = true
        const response = await apiClient.getShiftById(props.eventId, props.shiftId)
        shiftInfo.value = response.shift
    } catch (error) {
        console.warn(`Failed to fetch shift info for ${props.eventId}:${props.shiftId}`, error)
        // Keep shiftInfo as null to show fallback
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchShiftInfo()
})
</script>
