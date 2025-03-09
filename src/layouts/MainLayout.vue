<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Izbornik"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          QR Kod Majstor
        </q-toolbar-title>
        <div>QR Kod Majstor v{{ $q.version }}</div>
        <q-toggle
          v-model="isDarkMode"
          label="Dark Mode"
          color="primary"
          class="q-ml-md"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>Alati za QR kod</q-item-label>

        <q-item clickable to="/qr-code-scanner">
          <q-item-section avatar>
            <q-icon name="qr_code_scanner" />
          </q-item-section>
          <q-item-section>
            <q-item-label>QR Skener</q-item-label>
            <q-item-label caption>Skeniraj QR kodove</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable to="/qr-generator">
          <q-item-section avatar>
            <q-icon name="qr_code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>QR Generator</q-item-label>
            <q-item-label caption>Kreiraj prilagođene QR kodove</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable to="/save-qr-codes">
          <q-item-section avatar>
            <q-icon name="save" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Spremljeni QR Kodovi</q-item-label>
            <q-item-label caption>Pogledajte svoje QR kodove</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const leftDrawerOpen = ref(false)
const isDarkMode = ref($q.dark.isActive)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

watch(isDarkMode, (newVal) => {
  $q.dark.set(newVal)
})
</script>
