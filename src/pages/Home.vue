<template>
  <div class="bloc-bandeau pt-40 pb-56 text-center">
    <h1
      class="text-7xl text-custom-white font-family-urban text-shadow-lg pb-8"
    >
      Envie de jouer <span class="font-family-red-hat">?</span>
    </h1>
    <h2
      class="text-2xl text-custom-white bg-custom-blue inline-block px-10 py-3 rounded-lg"
    >
      Trouvez des joueurs ou des événements sur boardy.
    </h2>
  </div>

  <div class="bloc-cat grid grid-cols-3 gap-24 px-40">
    <router-link to="/category/organisation" class="red-border">
      <div class="card-red bg-custom-red p-8 rounded-xl h-full cursor-pointer">
        <div class="flex justify-between items-center">
          <IconBars class="text-custom-white" />
          <p
            class="text-custom-white text-xl font-primary bg-custom-blue rounded-3xl px-7 py-2.5 border border-custom-white"
          >
            {{ activityStore.getOrganisationActivitiesCount }}
          </p>
        </div>
        <h3 class="text-2xl font-black text-custom-white py-4">
          Bars & Soirées
        </h3>
        <p class="text-2xl font-light text-custom-white">
          Evenements organisés par des établissements ou organisations.
        </p>
      </div>
    </router-link>

    <router-link to="/category/user" class="red-border">
      <div class="card-red bg-custom-red p-8 rounded-xl h-full">
        <div class="flex justify-between items-center">
          <IconGamers class="text-custom-white" />
          <p
            class="text-custom-white text-xl font-black bg-custom-blue rounded-3xl px-7 py-2.5 border border-custom-white"
          >
            {{ activityStore.getUserActivitiesCount }}
          </p>
        </div>
        <h3 class="text-2xl font-black text-custom-white py-4">
          Par des joueurs
        </h3>
        <p class="text-2xl font-light text-custom-white">
          Trouver des joueurs proches de chez vous qui cherchent d'autres
          joueurs.
        </p>
      </div>
    </router-link>
    <router-link to="/category/event" class="red-border">
      <div class="card-red bg-custom-red p-8 rounded-xl h-full">
        <div class="flex justify-between items-center">
          <IconEvents class="text-custom-white" />
          <p
            class="text-custom-white text-xl font-black bg-custom-blue rounded-3xl px-7 py-2.5 border border-custom-white"
          >
            {{ activityStore.getEventActivitiesCount }}
          </p>
        </div>
        <h3 class="text-2xl font-black text-custom-white py-4">
          Festivals & conventions
        </h3>
        <p class="text-2xl font-light text-custom-white">
          Les grands événements et rassemblements de la communauté.
        </p>
      </div>
    </router-link>
  </div>

  <div class="mx-50 mb-35">
    <FilterBar />
  </div>

  <!-- Section des activités à venir -->
  <div
    class="bloc-activites"
    :class="{ 'has-activities': paginatedActivities.length >= 7 }"
  >
    <div class="mx-30 pb-16">
      <h2 class="text-md font-bold mb-6">
        {{ activityStore.getUpcomingActivities.length }} événements trouvés
      </h2>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement des activités...</p>
      </div>

      <div v-else-if="activityStore.error" class="text-center py-8">
        <p class="text-red-600">{{ activityStore.error }}</p>
      </div>

      <div
        v-else-if="activityStore.getUpcomingActivities.length === 0"
        class="text-center py-8"
      >
        <p class="text-gray-600">Aucune activité à venir pour le moment.</p>
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
        v-if="totalPages > 1"
        class="flex justify-center items-center gap-4 mt-8"
      >
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-custom-blue text-custom-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Précédent
        </button>

        <span class="text-gray-700">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-[#1468E5] text-custom-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>

  <div class="py-16 text-center flex flex-row justify-center">
    <p class="flex text-custom-primary items-center me-5 text-2xl">
      D'autres idées ou recommandations ?
    </p>
    <router-link
      to="/"
      class="text-custom-white hover:cursor-pointer bg-custom-blue px-6 py-3 rounded-2xl text-2xl font-bold inline-block"
    >
      On en discute !
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useActivityStore } from "../stores/activityStore";
import ActivityCard from "../components/molecules/ActivityCard.vue";
import IconBars from "../components/atoms/icons/IconBars.vue";
import IconEvents from "../components/atoms/icons/IconEvents.vue";
import IconGamers from "../components/atoms/icons/IconGamers.vue";
import FilterBar from "@/components/molecules/FilterBar.vue";

// Utiliser le store
const activityStore = useActivityStore();

// Pagination
const currentPage = ref(1);
const itemsPerPage = 9;

// Calculer le nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(activityStore.getUpcomingActivities.length / itemsPerPage);
});

// Activités paginées
const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return activityStore.getUpcomingActivities.slice(start, end);
});

// Charger les activités au montage
onMounted(() => {
  activityStore.fetchActivities();
});
</script>
