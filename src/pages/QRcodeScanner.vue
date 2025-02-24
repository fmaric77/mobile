<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- QR scanner functionality -->
      <q-btn label="Start Scan" @click="startScan" />
      <q-btn label="Stop Scan" @click="stopScan" class="q-ml-sm" />
      <div v-if="decodedResult">
        <p>Decoded QR Code:</p>
        <p>{{ decodedResult }}</p>
      </div>
      <div v-if="errorMsg">
        <p>Error:</p>
        <pre>{{ errorMsg }}</pre>
      </div>
      <div v-if="detailedLog.length">
        <p>Detailed Logs:</p>
        <div v-for="(log, index) in detailedLog" :key="index">
          <pre>{{ log }}</pre>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

const decodedResult = ref('')
const errorMsg = ref('')
const detailedLog = ref([])

const logError = (error) => {
  let errorDetails = ''
  if (error instanceof Error) {
    errorDetails = `Message: ${error.message}\nStack: ${error.stack}`
  } else {
    errorDetails = JSON.stringify(error, null, 2)
  }
  detailedLog.value.push(errorDetails)
}

const startScan = async () => {
  try {
    // Check or request camera permission
    const permission = await BarcodeScanner.checkPermission({ force: true })
    if (!permission.granted) {
      throw new Error('Camera permission not granted')
    }

    // Start scanning
    const result = await BarcodeScanner.startScan()
    if (result.hasContent) {
      decodedResult.value = result.content
    }
  } catch (error) {
    errorMsg.value = error.message || JSON.stringify(error)
    logError(error)
  }
}

const stopScan = async () => {
  try {
    await BarcodeScanner.stopScan()
  } catch (error) {
    errorMsg.value = error.message || JSON.stringify(error)
    logError(error)
  }
}
</script>

<style scoped>
/* Removed active-flash styles as toggle flash feature was removed */
</style>