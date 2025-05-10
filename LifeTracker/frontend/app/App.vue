<template>
  <Navbar @toggle-edit-mode="forwardToggleEditMode" />
  <RouterView />
</template>

<script setup>
import Navbar from './components/layout/Navbar.vue'
import { RouterView } from 'vue-router'

const forwardToggleEditMode = () => {
  const event = new CustomEvent('toggle-edit-mode', { bubbles: true })
  window.dispatchEvent(event)
}
</script>