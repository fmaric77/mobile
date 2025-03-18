<template>
  <q-page class="q-pa-md">

    <!-- QR Codes List -->
    <div v-if="savedQRCodes.length" class="row q-col-gutter-md">
      <div v-for="(qr, index) in savedQRCodes" :key="qr.id" class="col-12 col-sm-6 col-md-4">
        <q-card>
          <q-card-section>
            <q-img :src="qr.image" :alt="qr.text" />
            <div class="text-subtitle1 q-mt-md">{{ qr.text }}</div>
            <div class="text-caption">Stvoreno: {{ new Date(qr.createdAt).toLocaleString() }}</div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat icon="content_copy" @click="copyToClipboard(qr.text)" />
            <q-btn flat icon="delete" color="negative" @click="confirmDelete(index)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div v-else class="text-center q-mt-lg">
      <q-icon name="info" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md">Nema spremljenih QR kodova</div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="confirmDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Jeste li sigurni da želite izbrisati ovaj QR kod?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Izbriši" color="negative" @click="deleteQRCode" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Haptics } from '@capacitor/haptics'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const savedQRCodes = ref([])
const confirmDeleteDialog = ref(false)
const deleteIndex = ref(null)

// Load QR codes with dates if they don't have them
onMounted(() => {
  const stored = JSON.parse(localStorage.getItem('savedQRCodes') || '[]')
  savedQRCodes.value = stored.map(qr => ({
    ...qr,
    createdAt: qr.createdAt || new Date().toISOString(),
    id: qr.id || Math.random().toString(36).substr(2, 9)
  }))
})

const confirmDelete = (index) => {
  deleteIndex.value = index
  confirmDeleteDialog.value = true
}

const deleteQRCode = async () => {
  if (deleteIndex.value !== null) {
    savedQRCodes.value.splice(deleteIndex.value, 1)
    localStorage.setItem('savedQRCodes', JSON.stringify(savedQRCodes.value))
    await Haptics.vibrate({ duration: 300 })
    deleteIndex.value = null
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      $q.notify({
        message: 'Text copied to clipboard',
        color: 'positive',
        icon: 'content_copy'
      })
    })
    .catch(err => {
      console.error('Failed to copy:', err)
      $q.notify({
        message: 'Failed to copy text',
        color: 'negative',
        icon: 'error'
      })
    })
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