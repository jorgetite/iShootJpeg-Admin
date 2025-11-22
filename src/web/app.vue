<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

// Set the base path for Shoelace assets
setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.0/cdn/');
</script>
