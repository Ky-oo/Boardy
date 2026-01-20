<template>
  <div class="flex justify-center mt-8">
    <button
      v-if="activityStore.hasMore"
      @click="$emit('fetchFiltered')"
      :disabled="activityStore.loading"
      class="px-6 py-3 hover:cursor-pointer bg-custom-blue text-custom-white rounded-lg hover:bg-custom-blue-hover disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ activityStore.loading ? "Chargement..." : "Voir plus d'événements" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useActivityStore } from "@/stores/activityStore";

const activityStore = useActivityStore();
</script>
