<template>
  <div id="app" class="app-container">
    <!-- Particle Effects Container -->
    <div class="particle-container" id="particleContainer"></div>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { initializeTheme } = useTheme()

onMounted(() => {
  initializeTheme()
})
</script>