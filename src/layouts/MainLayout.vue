<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          QR Code Master
        </q-toolbar-title>
        <div>QR Code Master v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Index',
    caption: 'Home Page',
    icon: 'home',
    link: '/'
  },
  {
    title: 'KozmetikaWeb',
    caption: 'Mobile Features',
    icon: 'smartphone',
    link: '/kozmetikaweb'
  },
  {
    title: 'Photo Loader',
    caption: 'Load Photos',
    icon: 'image',
    link: '/photo-loader'
  },
  {
    title: 'Moj QR Kodovi',
    caption: 'View saved QR codes',
    icon: 'qr_code',
    link: '/save-qr-codes'
  },
  {
    title: 'QR Scanner',
    caption: 'Scan QR codes on the fly',
    icon: 'qr_code_scanner',
    link: '/qr-code-scanner'
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
