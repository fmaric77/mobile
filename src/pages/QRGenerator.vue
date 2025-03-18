<template>
  <q-page class="q-pa-md">
    <div>
      <q-input v-model="qrText" label="Tekst za kodiranje" />

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-6">
          <q-input
            v-model="qrOptions.color.dark"
            label="Tamna boja QR koda"
            type="color"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model="qrOptions.color.light"
            label="Svijetla boja QR koda"
            type="color"
          />
        </div>
      </div>

      <q-img :src="qrCodeImage" alt="QR Kod" v-if="qrCodeImage" class="q-mt-md" />
    </div>

    <div v-if="!isOnline" class="q-mb-md">
      <q-banner dense class="bg-red text-white">
        Nema internet veze
      </q-banner>
    </div>

    <q-btn label="Spremi QR kod" @click="saveQRCode" color="primary" class="q-mt-md" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import QRCode from 'qrcode';

const isOnline = ref(navigator.onLine);
const errorMessage = ref('');
const qrText = ref('Pozdrav, QR Kod');
const qrCodeImage = ref('');
const qrOptions = ref({
  errorCorrectionLevel: 'H',
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 256,
});

onMounted(() => {
  console.log('Stranica učitana');
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  generateQRCode();
});

onBeforeUnmount(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

const generateQRCode = () => {
  QRCode.toDataURL(qrText.value, qrOptions.value, (err, url) => {
    if (err) {
      console.error(err);
      errorMessage.value = err.message;
      return;
    }
    qrCodeImage.value = url;
  });
};

const saveQRCode = () => {
  let savedCodes = JSON.parse(localStorage.getItem('savedQRCodes') || '[]');
  savedCodes.push({
    text: qrText.value,
    options: qrOptions.value,
    image: qrCodeImage.value // Spremi podatke QR koda
  });
  localStorage.setItem('savedQRCodes', JSON.stringify(savedCodes));
};

// Watch both qrText and qrOptions. The deep option ensures that promjene (changes) in the nested color properties are tracked.
watch([qrText, qrOptions], () => {
  generateQRCode();
}, { deep: true });
</script>