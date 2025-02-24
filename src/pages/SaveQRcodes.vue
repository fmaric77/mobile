<template>
  <q-page class="q-pa-md">
    <div v-if="savedQRCodes.length === 0">
      <p>No QR codes saved yet.</p>
    </div>
    <div v-else>
      <div v-for="(qrCode, index) in savedQRCodes" :key="index" class="q-mb-md">
        <q-img :src="qrCode.image" :alt="`QR Code ${index}`" style="max-width: 200px;" />
        <p>Text: {{ qrCode.text }}</p>
        <!-- Delete button -->
        <q-btn color="negative" label="Delete" @click="deleteQRCode(index)" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Haptics } from '@capacitor/haptics'

const savedQRCodes = ref([])

onMounted(() => {
  savedQRCodes.value = JSON.parse(localStorage.getItem('savedQRCodes') || '[]')
})

async function deleteQRCode(index) {
  savedQRCodes.value.splice(index, 1)
  localStorage.setItem('savedQRCodes', JSON.stringify(savedQRCodes.value))
  await Haptics.vibrate({ duration: 300 })
}
</script>