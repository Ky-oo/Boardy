<template>
  <div class="container mx-auto">
    <div
      class="bloc-activites mx-5 md:mx-15"
      :class="{
        'has-activities': upcomingActivitiesFiltered.length >= 7,
      }"
    >
      <div>
        Découvre les événements du monde du jeu de société et participe à ceux
        qui t'intéressent.
      </div>
      <div class="pb-16">
        <div class="flex justify-between flex-col md:flex-row py-4">
          <h2 class="text-xl md:text-2xl font-bold mb-6">
            Événements populaires
          </h2>
          <ActvityTypesDropdown
            @update-selected-type="
              (newFilter: ActivityType | '') => {
                selectedType = newFilter;
                emit('fetchFiltered', [newFilter]);
              }
            "
          />
        </div>

        <div v-if="activityStore.loading" class="text-center py-8">
          <p class="text-gray-600">Chargement des activités...</p>
        </div>

        <div v-else-if="activityStore.error" class="text-center py-8">
          <p class="text-red-600">{{ activityStore.error }}</p>
        </div>

        <div
          v-else-if="upcomingActivitiesFiltered.length === 0"
          class="text-center py-8"
        >
          <p class="text-gray-600">Aucune activité à venir pour le moment.</p>
        </div>

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ActivityCard
              v-for="activity in upcomingActivitiesFiltered"
              :key="activity.id"
              :activity="activity"
            />
          </div>
          <LoadMoreButton />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ActivityCard from "@/components/molecules/ActivityCard.vue";
import ActvityTypesDropdown from "@/components/molecules/dropdown/ActvityTypesDropdown.vue";
import type { ActivityType } from "@/types/Activity";
import { useActivityStore } from "@/stores/activityStore";

const activityStore = useActivityStore();

const emit = defineEmits(["fetchFiltered"]);

const selectedType = ref<"" | ActivityType>("");

const upcomingActivitiesFiltered = computed(() => {
  const type = selectedType.value;
  const upcomingActivity = activityStore.getUpcomingActivities;

  if (!type) return upcomingActivity;

  return upcomingActivity.filter((activity) => activity.type === type);
});
</script>
