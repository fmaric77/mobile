<template>
  <q-page class="q-pa-md">
    <div v-if="!isOnline" class="q-mb-md">
      <q-banner dense class="bg-red text-white">
        No Internet Connection
      </q-banner>
    </div>
    <div class="row q-col-gutter-md justify-center">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        @click="toggleButtons(photo)"
      >
        <q-img :src="photo" alt="Uploaded Photo" />
        <div v-if="selectedPhoto === photo" class="q-mt-sm flex justify-around">
          <q-btn flat color="primary" label="Share Photo" @click.stop="sharePhoto(photo)" />
          <q-btn flat color="secondary" label="Edit Photo" @click.stop="openImageEditor(photo)" />
          <q-btn flat color="negative" label="Delete Photo" @click.stop="deletePhoto(photo)" />
        </div>
      </div>
    </div>

    <q-dialog v-model="imageEditorDialog" full-width>
      <q-card>
        <q-card-section>
          <div class="text-h6">Image Editor</div>
        </q-card-section>

        <q-card-section>
          <div v-if="editingImage">
            <template v-if="editingImage">
              <v-stage ref="stageRef" :config="stageSize">
                <v-layer>
                  <v-image :config="imageProps" />
                </v-layer>
              </v-stage>
            </template>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Share } from '@capacitor/share'
import { Haptics } from '@capacitor/haptics'

const router = useRouter()
const photos = ref([])

// Online status ref and handler setup
const isOnline = ref(navigator.onLine)
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}
window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)
onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

// Load the stored photos from local storage
const loadLocalPhotos = () => {
  const storedPhotos = localStorage.getItem('uploadedPhotos')
  if (storedPhotos) {
    photos.value = JSON.parse(storedPhotos)
  }
}
onMounted(() => {
  loadLocalPhotos()
})

// Selected photo for which the buttons are shown
const selectedPhoto = ref(null)
const toggleButtons = (photo) => {
  selectedPhoto.value = (selectedPhoto.value === photo) ? null : photo
}

const sharePhoto = async (photo) => {
  try {
    const response = await fetch(photo)
    if (!response.ok) {
      throw new Error('Failed to fetch image.')
    }
    const blob = await response.blob()
    let parts = photo.split('/')
    let fileName = parts[parts.length - 1] || 'photo.jpg'
    if (!fileName.includes('.')) {
      fileName += blob.type === 'image/png' ? '.png' : (blob.type === 'image/gif' ? '.gif' : '.jpg')
    }
    const file = new File([blob], fileName, { type: blob.type })
    await Share.share({
      title: 'Photo',
      text: 'Sharing photo from KozmetikaWeb',
      files: [file],
      dialogTitle: 'Share Photo'
    })
  } catch (err) {
    console.error('Error sharing photo:', err)
  }
  selectedPhoto.value = null
}

const deletePhoto = (photo) => {
  const storedPhotos = localStorage.getItem('uploadedPhotos')
  let currentPhotos = storedPhotos ? JSON.parse(storedPhotos) : []
  currentPhotos = currentPhotos.filter(p => p !== photo)
  localStorage.setItem('uploadedPhotos', JSON.stringify(currentPhotos))
  photos.value = currentPhotos
  selectedPhoto.value = null
  Haptics.vibrate()
}

// Image Editor
const imageEditorDialog = ref(false)
const editingImage = ref(null)
const stageSize = ref({
  width: 300,
  height: 300
})
const stageRef = ref(null)
const imageProps = computed(() => {
  return editingImage.value
    ? {
        image: editingImage.value,
        width: stageSize.value.width,
        height: stageSize.value.height
      }
    : {}
})

const openImageEditor = (photo) => {
  // Navigate to PhotoLoader page passing the photo URL in the query string
  router.push({ name: 'PhotoLoader', query: { photo } })
}

const saveImage = () => {
  const stage = stageRef.value.getStage()
  const editedDataURL = stage.toDataURL()
  
  const photoIndex = photos.value.findIndex(p => p === selectedPhoto.value)
  if (photoIndex !== -1) {
    photos.value[photoIndex] = editedDataURL
    localStorage.setItem('uploadedPhotos', JSON.stringify(photos.value))
  }
  
  imageEditorDialog.value = false
  selectedPhoto.value = null
}
</script>