<script setup lang="ts">
import Footer from "./components/organisms/footer/Footer.vue";
import Navbar from "./components/organisms/navbar/Navbar.vue";
import FloatingChatButton from "./components/atoms/FloatingChatButton.vue";
</script>

<template>
  <Navbar class="mx-30 rounded-b-2xl" />

  <main class="">
    <RouterView />
  </main>

  <Footer />

  <FloatingChatButton />
</template>

<style scoped></style>
