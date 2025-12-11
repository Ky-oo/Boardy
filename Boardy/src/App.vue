<script setup lang="ts">
import Footer from "./components/organisms/footer/Footer.vue";
import Navbar from "./components/organisms/navbar/Navbar.vue";

import { useRoute } from "vue-router";

const route = useRoute();

console.log("Route name:", route.name);

const isFooterVisible =
  route.name != "login" &&
  route.name != "register" &&
  route.name != "create-event";
</script>

<template>
  <Navbar class="mx-30 rounded-b-2xl" />

  <main class="">
    <RouterView />
  </main>

  <Footer v-if="isFooterVisible" />
</template>

<style scoped></style>
