<script setup lang="ts">
import Footer from "./components/organisms/footer/Footer.vue";
import Navbar from "./components/organisms/navbar/Navbar.vue";
import ToastContainer from "./components/organisms/ToastContainer.vue";
import { Analytics } from "@vercel/analytics/next";

import { useRoute } from "vue-router";
import { useTokenExpirationCheck } from "./composables/useTokenExpirationCheck";

const route = useRoute();

useTokenExpirationCheck();

const isFooterVisible =
  route.name != "login" &&
  route.name != "register" &&
  route.name != "create-event";
</script>

<template>
  <Analytics />
  <Navbar />

  <main class="">
    <RouterView />
  </main>

  <Footer v-if="isFooterVisible" />
  <ToastContainer />
</template>

<style scoped></style>
