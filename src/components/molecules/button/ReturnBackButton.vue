<template>
  <button
    @click="$router.back()"
    class="flex items-center text-custom-primary text-2xl py-3 hover:cursor-pointer mb-6"
  >
    <IconChevronLeft class="mr-2" /> Retour
  </button>
</template>

<script setup lang="ts">
import IconChevronLeft from "@/components/atoms/icons/IconChevronLeft.vue";
</script>

<style scoped></style>
