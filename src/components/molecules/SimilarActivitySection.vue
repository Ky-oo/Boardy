<template>
  <div class="container mx-auto pb-16 pt-8 px-5">
    <h2 class="text-2xl font-bold mb-6">Événements similaires</h2>

    <div v-if="activityStore.loading" class="text-center py-8">
      <p class="text-gray-600">Chargement des activités...</p>
    </div>

    <div v-else-if="activityStore.error" class="text-center py-8">
      <p class="text-red-600">{{ activityStore.error }}</p>
    </div>

    <div
      v-else-if="activityStore.getSimilarActivities.length === 0"
      class="text-center py-8"
    >
      <p class="text-gray-600">Aucune activité similaire pour le moment.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <ActivityCard
        v-for="activity in activityStore.getSimilarActivities"
        :key="activity.id"
        :activity="activity"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useActivityStore } from "@/stores/activityStore";
import ActivityCard from "@/components/molecules/ActivityCard.vue";

const activityStore = useActivityStore();
</script>

<style scoped></style>
