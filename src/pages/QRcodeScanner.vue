<template>
  <q-page class="scanner-page">
    <!-- Scanner Overlay -->
    <div :class="['scanner-container', { 'scanning': isScanning }]">
      <!-- Scanner Frame -->
      <div class="scan-frame" v-show="isScanning">
        <div class="corner-tl"></div>
        <div class="corner-tr"></div>
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <div class="scan-line" v-show="isScanning"></div>
      </div>

      <!-- Status Banner -->
      <q-banner v-if="!isScanning" class="status-banner bg-dark text-white">
        <template v-slot:avatar>
          <q-icon name="qr_code_scanner" color="primary" />
        </template>
        Usmjerite kameru prema QR kodu za skeniranje
      </q-banner>
    </div>

    <!-- Controls -->
    <div class="scanner-controls q-pa-md">
      <div class="row q-col-gutter-md justify-center">
        <div class="col-12 col-sm-6">
          <q-btn
            :label="isScanning ? 'Zaustavi skener' : 'Pokreni skener'"
            :color="isScanning ? 'negative' : 'primary'"
            :icon="isScanning ? 'stop' : 'qr_code_scanner'"
            @click="isScanning ? stopScan() : startScan()"
            class="full-width"
            size="lg"
          />
        </div>
      </div>

      <!-- Results Card -->
      <q-card v-if="decodedResult" class="q-mt-md result-card">
        <q-card-section>
          <div class="text-h6">Rezultat skeniranja</div>
          <div class="text-body1">{{ decodedResult }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat icon="content_copy" @click="copyToClipboard(decodedResult)" />
          <q-btn flat icon="save" @click="saveQRCode" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Permission Dialog -->
    <q-dialog v-model="showPermissionDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="camera_alt" color="primary" text-color="white" />
          <span class="q-ml-sm">Camera permission is required to scan QR codes.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Grant Permission" color="primary" @click="requestPermission" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
import { Haptics } from '@capacitor/haptics'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode' // Add this import

const $q = useQuasar()
const router = useRouter()

const isScanning = ref(false)
const decodedResult = ref('')
const showPermissionDialog = ref(false)

const prepareScan = () => {
  document.querySelector('body').classList.add('scanner-active')
  BarcodeScanner.hideBackground()
}

const cleanupScan = () => {
  document.querySelector('body').classList.remove('scanner-active')
  BarcodeScanner.showBackground()
}

onMounted(() => {
  checkPermission()
  startScan()
})

onBeforeUnmount(() => {
  cleanupScan()
  stopScan()
})

const checkPermission = async () => {
  try {
    const status = await BarcodeScanner.checkPermission({ force: false })
    if (!status.granted) {
      showPermissionDialog.value = true
    }
  } catch (error) {
    handleError(error)
  }
}

const requestPermission = async () => {
  try {
    const status = await BarcodeScanner.checkPermission({ force: true })
    showPermissionDialog.value = false
    if (status.granted) {
      startScan()
    }
  } catch (error) {
    handleError(error)
  }
}

const startScan = async () => {
  try {
    const status = await BarcodeScanner.checkPermission({ force: true })
    if (status.granted) {
      prepareScan()
      isScanning.value = true
      const result = await BarcodeScanner.startScan()
      if (result.hasContent) {
        decodedResult.value = result.content
        await Haptics.vibrate()
        await stopScan()
      }
    } else {
      showPermissionDialog.value = true
    }
  } catch (error) {
    handleError(error)
  }
}

const stopScan = async () => {
  try {
    await BarcodeScanner.stopScan()
    isScanning.value = false
    cleanupScan()
  } catch (error) {
    handleError(error)
  }
}

const handleError = (error) => {
  // Silent error handling - just log to console and reset the scan state
  console.error('Scanner error:', error)
  isScanning.value = false
  cleanupScan()
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    $q.notify({
      message: 'Copied to clipboard',
      color: 'positive',
      icon: 'content_copy'
    })
  } catch (error) {
    handleError(error)
  }
}

const saveQRCode = async () => {
  try {
    // Generate QR code image from scanned text
    const qrCodeImage = await QRCode.toDataURL(decodedResult.value, {
      errorCorrectionLevel: 'H',
      width: 256,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    const qrCode = {
      text: decodedResult.value,
      image: qrCodeImage, // Store the generated QR code image
      createdAt: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    }
    
    const savedCodes = JSON.parse(localStorage.getItem('savedQRCodes') || '[]')
    savedCodes.push(qrCode)
    localStorage.setItem('savedQRCodes', JSON.stringify(savedCodes))
    
    await Haptics.vibrate({ duration: 100 })
    
    $q.notify({
      message: 'QR Code saved successfully',
      color: 'positive',
      icon: 'save'
    })
    
    // Optionally navigate to saved codes
    router.push('/save-qr-codes')
  } catch (error) {
    handleError(error)
  }
}
</script>

<style lang="scss" scoped>
@import 'QRcodeScanner.scss';
</style>