<template>
  <div class="border border-custom-blue/20 rounded-xl p-4 bg-custom-white">
    <p class="font-semibold text-primary">{{ organisation.name }}</p>
    <p class="text-sm text-gray-600">{{ organisation.address }}</p>
    <p class="text-xs text-gray-500">Owner ID: {{ organisation.ownerId }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Organisation } from "@/types/Organisation";
defineProps<{
  organisation: Organisation;
}>();
</script>

<style scoped></style>
