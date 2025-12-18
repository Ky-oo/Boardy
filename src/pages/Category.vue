<template>
  <div class="pt-40 mx-30 py-8">
    <button
      @click="$router.back()"
      class="flex items-center text-custom-primary text-2xl py-3 hover:cursor-pointer mb-6"
    >
      <IconChevronLeft class="mr-2" /> Retour
    </button>

    <div class="flex items-end gap-4 mb-8">
      <component :is="categoryIcon" class="text-custom-primary w-16 h-16" />
      <h1 class="text-4xl font-primary text-custom-primary">
        {{ categoryTitle }}
      </h1>
    </div>

    <p class="text-lg text-gray-600 mb-6">
      {{ categoryDescription }}
    </p>

    <div
      class="bloc-cat-event"
      :class="{ 'has-activities': paginatedActivities.length >= 7 }"
    >
      <div class="mx-20 mb-6">
        <FilterBar />
      </div>

      <p class="text-lg text-gray-600 mb-6">
        {{ filteredActivities.length }} événement(s) trouvé(s)
      </p>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement des activités...</p>
      </div>

      <div v-else-if="activityStore.error" class="text-center py-8">
        <p class="text-red-600">{{ activityStore.error }}</p>
      </div>

      <div v-else-if="filteredActivities.length === 0" class="text-center py-8">
        <p class="text-gray-600">
          Aucune activité disponible dans cette catégorie.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActivityCard
          v-for="activity in paginatedActivities"
          :key="activity.id"
          :activity="activity"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredActivities.length > itemsPerPage"
        class="flex justify-center items-center gap-4 mt-8"
      >
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border border-custom-primary text-custom-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-custom-primary hover:text-custom-white transition-colors"
        >
          Précédent
        </button>

        <div class="flex gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-4 py-2 rounded-lg border transition-colors',
              currentPage === page
                ? 'bg-custom-primary text-custom-white border-custom-primary'
                : 'border-custom-primary text-custom-primary hover:bg-custom-primary hover:text-custom-white',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border border-custom-primary text-custom-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-custom-primary hover:text-custom-white transition-colors"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useActivityStore } from "../stores/activityStore";
import ActivityCard from "@/components/molecules/ActivityCard.vue";
import IconChevronLeft from "../components/atoms/icons/IconChevronLeft.vue";
import IconBars from "../components/atoms/icons/IconBars.vue";
import IconGamers from "../components/atoms/icons/IconGamers.vue";
import IconEvents from "../components/atoms/icons/IconEvents.vue";
import FilterBar from "@/components/molecules/FilterBar.vue";

const route = useRoute();
const activityStore = useActivityStore();

const currentPage = ref(1);
const itemsPerPage = 9;

const categoryType = computed(() => route.params.type as string);

const categoryIcon = computed(() => {
  switch (categoryType.value) {
    case "organisation":
      return IconBars;
    case "user":
      return IconGamers;
    case "event":
      return IconEvents;
  }
});

const categoryDescription = computed(() => {
  switch (categoryType.value) {
    case "organisation":
      return "Evenements organisés par des établissements ou organisations.";
    case "user":
      return "Trouver des joueurs proches de chez vous qui cherchent d’autres joueurs.";
    case "event":
      return "Les grands événements et rassemblements de la communauté.";
  }
});

const categoryTitle = computed(() => {
  switch (categoryType.value) {
    case "organisation":
      return "Bars & Soirées";
    case "user":
      return "Par des joueurs";
    case "event":
      return "Festivals & conventions";
    default:
      return "Toutes les activités";
  }
});

const filteredActivities = computed(() => {
  const now = new Date();
  return activityStore.activities.filter(
    (a) => a.hostType === categoryType.value && new Date(a.date) > now
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredActivities.value.length / itemsPerPage)
);

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredActivities.value.slice(start, end);
});

onMounted(() => {
  if (activityStore.activities.length === 0) {
    activityStore.fetchActivities();
  }
});
</script>
