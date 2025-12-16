<template>
  <div class="pt-40 mx-30 py-8">
    <h1
      class="text-4xl text-center font-family-urban font-black text-custom-primary mb-8"
    >
      Mes événements
    </h1>

    <!-- Événements à venir -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-custom-primary mb-6">
        À venir ({{ upcomingActivities.length }})
      </h2>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="upcomingActivities.length === 0" class="text-center py-8">
        <p class="text-gray-600">Aucun événement à venir.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActivityCard
          v-for="activity in upcomingActivities"
          :key="activity.id"
          :activity="activity"
        />
      </div>
    </section>

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
import { useAuth } from "@/stores/authStore";

const activityStore = useActivityStore();
const authStore = useAuth();

const createdActivities = computed(() => {
  if (!authStore.user) return [];
  return activityStore.getMyCreatedActivities(authStore.user.id);
});

const joinedActivities = computed(() => {
  if (!authStore.user) return [];
  return activityStore.getMyJoinedActivities(authStore.user.id);
});

const upcomingActivities = computed(() => {
  if (!authStore.user) return [];
  const now = new Date();
  return activityStore
    .getMyJoinedActivities(authStore.user.id)
    .filter((activity) => new Date(activity.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

onMounted(() => {
  if (activityStore.activities.length === 0) {
    activityStore.fetchActivities();
  }
});
</script>
