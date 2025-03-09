<template>
  <q-page class="q-pa-md">
    <!-- Search and View Controls -->
    <div class="row q-mb-md items-center justify-between">
      <q-input
        v-model="searchQuery"
        placeholder="Pretraži QR kodove"
        outlined
        dense
        class="col-grow q-mr-md"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      
      <div class="row items-center q-gutter-sm">
        <q-btn-toggle
          v-model="viewMode"
          flat
          toggle-color="primary"
          :options="[
            {label: 'Mreža', value: 'grid', icon: 'grid_view'},
            {label: 'Popis', value: 'list', icon: 'list'}
          ]"
        />
        
        <q-select
          v-model="sortBy"
          :options="sortOptions"
          outlined
          dense
        />
      </div>
    </div>

    <!-- QR Codes List -->
    <div v-if="savedQRCodes.length" :class="viewMode === 'grid' ? 'row q-col-gutter-md' : 'q-list'">
      <div v-for="(qr, index) in filteredQRCodes" :key="qr.id" :class="viewMode === 'grid' ? 'col-12 col-sm-6 col-md-4' : 'q-item'">
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
import { ref, computed, onMounted } from 'vue'
import { Haptics } from '@capacitor/haptics'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const savedQRCodes = ref([])
const searchQuery = ref('')
const viewMode = ref('grid')
const sortBy = ref('newest')
const confirmDeleteDialog = ref(false)
const deleteIndex = ref(null)

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Text (A-Z)', value: 'text-asc' },
  { label: 'Text (Z-A)', value: 'text-desc' }
]

// Load QR codes with dates if they don't have them
onMounted(() => {
  const stored = JSON.parse(localStorage.getItem('savedQRCodes') || '[]')
  savedQRCodes.value = stored.map(qr => ({
    ...qr,
    createdAt: qr.createdAt || new Date().toISOString(),
    id: qr.id || Math.random().toString(36).substr(2, 9)
  }))
})

const filteredQRCodes = computed(() => {
  let filtered = [...savedQRCodes.value]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(qr => 
      qr.text.toLowerCase().includes(query)
    )
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'text-asc':
        return a.text.localeCompare(b.text)
      case 'text-desc':
        return b.text.localeCompare(a.text)
      default:
        return 0
    }
  })
  
  return filtered
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