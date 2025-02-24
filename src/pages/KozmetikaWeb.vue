<template>
  <q-page class="q-pa-md flex flex-center column">
    <q-btn label="Take Photo" color="secondary" @click="takePhoto" class="q-mb-md" />

    <div v-if="location" class="q-mt-md">
      <div><strong>Latitude:</strong> {{ location.latitude }}</div>
      <div><strong>Longitude:</strong> {{ location.longitude }}</div>
    </div>
    <img v-if="photo" :src="photo" alt="Photo" style="max-width:300px" class="q-mt-md" />
    <div v-if="shareResult" class="q-mt-md">{{ shareResult }}</div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { Camera, CameraResultType } from '@capacitor/camera'

const location = ref(null)
const photo = ref(null)
const shareResult = ref('')

const takePhoto = async () => {
  try {
    const result = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      quality: 90
    })
    // Display the local photo
    photo.value = result.webPath
    shareResult.value = 'Photo taken, uploading to Cloudinary...'

    // Fetch the image as a blob
    const imageResponse = await fetch(result.webPath)
    const blob = await imageResponse.blob()

    // Prepare form data for Cloudinary upload
    const formData = new FormData()
    formData.append('file', blob)
    formData.append('upload_preset', 'frontpage') // Replace with your preset

    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/do3bpl7tn/upload' // Replace with your Cloud name
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    })

    const data = await uploadResponse.json()
    if (uploadResponse.ok) {
      const imageUrl = data.secure_url
      shareResult.value = 'Photo uploaded successfully. URL: ' + imageUrl
      
      // Retrieve any already saved photos, appending the new URL
      const storedPhotos = localStorage.getItem('uploadedPhotos')
      const currentPhotos = storedPhotos ? JSON.parse(storedPhotos) : []
      currentPhotos.push(imageUrl)
      localStorage.setItem('uploadedPhotos', JSON.stringify(currentPhotos))
    } else {
      shareResult.value = 'Upload failed: ' + data.error.message
    }
  } catch (error) {
    console.error('Error taking photo: ', error)
    shareResult.value = 'Error taking photo: ' + error
  }
}
</script>