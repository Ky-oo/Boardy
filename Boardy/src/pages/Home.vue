<template>
  <div class="pt-40 pb-16 text-center">
    <h1 class="text-3xl font-black">Envie de jouer ?</h1>
    <h2 class="text-2xl">Trouvez des joueurs ou des événements sur boardy.</h2>
  </div>

  <div class="grid grid-cols-3 gap-6 px-40 mb-16">
    <div class="bg-[#F7001F] p-8">
      <div class="flex justify-between items-center">
        <IconBars class="text-[#F4FFFD]" />
        <p class="text-[#F4FFFD]">
          {{ activityStore.getOrganisationActivitiesCount }}
        </p>
      </div>
      <h3>Bars & Soirées</h3>
    </div>
    <div class="bg-[#F7001F] p-8">
      <div class="flex justify-between items-center">
        <IconGamers class="text-[#F4FFFD]" />
        <p class="text-[#F4FFFD]">
          {{ activityStore.getUserActivitiesCount }}
        </p>
      </div>
      <h3>Par des joueurs</h3>
    </div>
    <div class="bg-[#F7001F] p-8">
      <div class="flex justify-between items-center">
        <IconEvents class="text-[#F4FFFD]" />
        <p class="text-[#F4FFFD]">?</p>
      </div>
      <h3>Festivals & conventions</h3>
    </div>
  </div>

  <!-- Section des activités à venir -->
  <div class="px-40 pb-16">
    <h2 class="text-2xl font-bold mb-6">Prochaines activités</h2>

    <div v-if="activityStore.loading" class="text-center py-8">
      <p class="text-gray-600">Chargement des activités...</p>
    </div>

    <div v-else-if="activityStore.error" class="text-center py-8">
      <p class="text-red-600">{{ activityStore.error }}</p>
    </div>

    <div
      v-else-if="activityStore.getActivities.length === 0"
      class="text-center py-8"
    >
      <p class="text-gray-600">Aucune activité à venir pour le moment.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ActivityCard
        v-for="activity in activityStore.getActivities"
        :key="activity.id"
        :activity="activity"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useActivityStore } from "../stores/activityStore";
import ActivityCard from "../components/molecules/ActivityCard.vue";
import IconBars from "../components/atoms/icons/IconBars.vue";
import IconEvents from "../components/atoms/icons/IconEvents.vue";
import IconGamers from "../components/atoms/icons/IconGamers.vue";

// Utiliser le store
const activityStore = useActivityStore();

// Charger les activités au montage
onMounted(() => {
  activityStore.fetchActivities();
});
</script>
