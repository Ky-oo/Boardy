<template>
  <div class="pt-40 mx-30 py-8">
    <h1 class="text-3xl font-black text-custom-primary mb-8">Mes événements</h1>

    <!-- Événements créés -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-custom-primary mb-6">
        Événements que j'ai créés ({{ createdActivities.length }})
      </h2>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="createdActivities.length === 0" class="text-center py-8">
        <p class="text-gray-600">Vous n'avez créé aucun événement.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActivityCard
          v-for="activity in createdActivities"
          :key="activity.id"
          :activity="activity"
        />
      </div>
    </section>

    <!-- Événements rejoints -->
    <section>
      <h2 class="text-2xl font-bold text-custom-primary mb-6">
        Événements auxquels je participe ({{ joinedActivities.length }})
      </h2>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="joinedActivities.length === 0" class="text-center py-8">
        <p class="text-gray-600">Vous ne participez à aucun événement.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActivityCard
          v-for="activity in joinedActivities"
          :key="activity.id"
          :activity="activity"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useActivityStore } from "../stores/activityStore";
import ActivityCard from "@/components/molecules/ActivityCard.vue";

const activityStore = useActivityStore();

// TODO: Remplacer par l'ID de l'utilisateur connecté (depuis un store auth par exemple)
const currentUserId = 1;

const createdActivities = computed(() =>
  activityStore.getMyCreatedActivities(currentUserId)
);

const joinedActivities = computed(() =>
  activityStore.getMyJoinedActivities(currentUserId)
);

onMounted(() => {
  // Charger les activités si elles ne sont pas déjà chargées
  if (activityStore.activities.length === 0) {
    activityStore.fetchActivities();
  }
});
</script>
