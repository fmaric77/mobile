<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- QR Code Input Section -->
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">Kreiraj QR Kod</div>
          
          <!-- Input Type Selection -->
          <q-btn-toggle
            v-model="inputType"
            class="full-width q-mb-md"
            :options="[
              { label: 'Tekst/URL', value: 'text', icon: 'text_fields' },
              { label: 'Kontakt', value: 'contact', icon: 'person' },
              { label: 'WiFi', value: 'wifi', icon: 'wifi' }
            ]"
            color="primary"
            dense
          />

          <!-- Dynamic Input Fields -->
          <div v-if="inputType === 'text'">
            <q-input
              v-model="textInput"
              label="Unesite tekst ili URL"
              outlined
              type="textarea"
              class="q-mb-md"
            />
          </div>

          <div v-if="inputType === 'contact'">
            <q-input v-model="contact.name" label="Ime" outlined class="q-mb-sm" />
            <q-input v-model="contact.phone" label="Telefon" outlined class="q-mb-sm" />
            <q-input v-model="contact.email" label="Email" outlined class="q-mb-sm" />
          </div>

          <div v-if="inputType === 'wifi'">
            <q-input v-model="wifi.ssid" label="Naziv mreže (SSID)" outlined class="q-mb-sm" />
            <q-input 
              v-model="wifi.password" 
              label="Lozinka" 
              outlined 
              :type="showPassword ? 'text' : 'password'"
              class="q-mb-sm"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
            <q-select
              v-model="wifi.encryption"
              :options="['WPA/WPA2', 'WEP', 'None']"
              label="Enkripcija"
              outlined
              class="q-mb-sm"
            />
          </div>

          <!-- Style Options -->
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-6">
              <q-select
                v-model="qrStyle.color"
                :options="colorOptions"
                label="Boja QR koda"
                outlined
                dense
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="qrStyle.size"
                :options="sizeOptions"
                label="Veličina"
                outlined
                dense
              />
            </div>
          </div>

          <q-btn
            color="primary"
            icon="qr_code"
            label="Generiraj QR Kod"
            @click="generateQRCode"
            class="full-width"
            :disable="!getQRContent"
          />
        </q-card>
      </div>

      <!-- QR Code Preview Section -->
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md text-center">
          <div class="text-h6 q-mb-md">Pregled</div>
          <div ref="qrContainer" class="flex justify-center q-mb-md">
            <!-- QR Code will be rendered here -->
          </div>
          
          <div class="row q-col-gutter-sm" v-if="qrGenerated">
            <div class="col-6">
              <q-btn
                color="primary"
                icon="save"
                label="Spremi"
                @click="saveQRCode"
                class="full-width"
              />
            </div>
            <div class="col-6">
              <q-btn
                color="secondary"
                icon="share"
                label="Podijeli"
                @click="shareQRCode"
                class="full-width"
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import { Share } from '@capacitor/share'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const qrContainer = ref(null)
const qrGenerated = ref(false)
const showPassword = ref(false)

// Input type handling
const inputType = ref('text')
const textInput = ref('')
const contact = ref({ name: '', phone: '', email: '' })
const wifi = ref({ ssid: '', password: '', encryption: 'WPA/WPA2' })

// QR style options
const qrStyle = ref({
  color: '#000000',
  size: 300
})

const colorOptions = [
  '#000000', '#1976D2', '#21BA45', '#C10015', '#FF9800'
].map(color => ({ label: color, value: color }))

const sizeOptions = [
  { label: 'Small (200px)', value: 200 },
  { label: 'Medium (300px)', value: 300 },
  { label: 'Large (400px)', value: 400 }
]

// Generate QR content based on input type
const getQRContent = computed(() => {
  switch (inputType.value) {
    case 'text':
      return textInput.value
    case 'contact':
      if (!contact.value.name && !contact.value.phone && !contact.value.email) return ''
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.value.name}\nTEL:${contact.value.phone}\nEMAIL:${contact.value.email}\nEND:VCARD`
    case 'wifi':
      if (!wifi.value.ssid) return ''
      return `WIFI:S:${wifi.value.ssid};T:${wifi.value.encryption};P:${wifi.value.password};;`
    default:
      return ''
  }
})

const generateQRCode = async () => {
  if (!getQRContent.value) return
  
  try {
    const canvas = await QRCode.toCanvas(qrContainer.value, getQRContent.value, {
      width: qrStyle.value.size,
      color: {
        dark: qrStyle.value.color,
        light: '#FFFFFF'
      }
    })
    qrContainer.value.innerHTML = ''
    qrContainer.value.appendChild(canvas)
    qrGenerated.value = true
  } catch (err) {
    console.error('Error generating QR code:', err)
    $q.notify({
      message: 'Failed to generate QR code',
      color: 'negative',
      icon: 'error'
    })
  }
}

const saveQRCode = async () => {
  try {
    const canvas = qrContainer.value.querySelector('canvas')
    const imageData = canvas.toDataURL('image/png')
    
    const savedCodes = JSON.parse(localStorage.getItem('savedQRCodes') || '[]')
    savedCodes.push({
      text: getQRContent.value,
      image: imageData,
      createdAt: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
      type: inputType.value
    })
    localStorage.setItem('savedQRCodes', JSON.stringify(savedCodes))
    
    $q.notify({
      message: 'QR Code saved successfully',
      color: 'positive',
      icon: 'save'
    })
  } catch (err) {
    console.error('Error saving QR code:', err)
    $q.notify({
      message: 'Failed to save QR code',
      color: 'negative',
      icon: 'error'
    })
  }
}

const shareQRCode = async () => {
  try {
    const canvas = qrContainer.value.querySelector('canvas')
    const imageData = canvas.toDataURL()
    await Share.share({
      title: 'Generated QR Code',
      text: getQRContent.value,
      url: imageData
    })
  } catch (err) {
    console.error('Error sharing QR code:', err)
    $q.notify({
      message: 'Failed to share QR code',
      color: 'negative',
      icon: 'error'
    })
  }
}
</script>

<style scoped>
.q-card {
  transition: all 0.3s ease;
}

.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>