<template>

  <div id="main-app-wrapper" :class="{ 'dark-mode': isDarkModeActive }">

    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
// If you manage dark mode globally, for example, via a Pinia store or simple ref here
// This example assumes HomeView or another component might toggle it and it's reflected on body
// For simplicity, let's assume a CSS class on body or a root element handles dark mode visually
// and `isDarkModeActive` is a reactive property that could be sourced from a store or local state.

// This is a simplified App.vue. The actual dark mode logic might be in HomeView or a global store.
// For the CSS to work as intended, the 'dark-mode' class needs to be on the body or a high-level container.
// The HomeView example includes a dark mode toggle that adds/removes 'dark-mode' from document.body.
// So, this computed property is more for components inside <router-view> if they need to react to it.
const isDarkModeActive = computed(() => {
  if (typeof document !== 'undefined') {
    return document.body.classList.contains('dark-mode');
  }
  return false;
});

</script>

<style>
/* Global styles if App.vue is the very root, or styles related to grad/svgs if they are always visible */
/* Your existing main.css and base.css are imported in main.js and will apply */
/* grad and svgs styles are from your main.css, ensure they apply correctly in context */
</style>