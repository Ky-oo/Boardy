<script setup lang="ts">
import Footer from "./components/organisms/footer/Footer.vue";
import Navbar from "./components/organisms/navbar/Navbar.vue";
</script>

<template>
  <Navbar class="mx-30 rounded-b-2xl" />

  <main class="page-container">
    <RouterView />
  </main>

  <Footer />
</template>

<style scoped></style>
