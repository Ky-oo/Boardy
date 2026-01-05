

<template>
  <div class="container bloc-bandeau text-center rounded-xl mx-auto">
    <h1
      class="text-3xl md:text-5xl mx-5 md:mx-15 text-custom-white pt-14 md:pt-20 font-family-red-hat font-black text-shadow-lg text-left"
    >
      Trouve des événements <br/>
      proche de chez toi !
    </h1>
  </div>

  <div class="container mx-auto">
    <div class="filter-bar mx-5 md:mx-15 mb-35 px-10 py-8 bg-custom-green rounded-xl">

      <FilterBar
        @update:search="onSearchUpdate"
        @update:date="onDateUpdate"
        @update:city="onCityUpdate"
      />
    </div>
   </div>

  <!-- Section des activités à venir -->
  <div class="container mx-auto">
    <div
      class="bloc-activites mx-5 md:mx-15"
      :class="{
        'has-activities': upcomingActivitiesFiltered.length >= 7,
      }"
    >
      <div>
        Découvre les événements du monde du jeu de société et participe à ceux qui t’intéressent.
      </div>
      <div class="pb-16">
        <div class="flex justify-between flex-col md:flex-row py-4">
          <h2 class="text-xl md:text-2xl font-bold mb-6">
            Événements populaires
          </h2>
          <div class="relative w-full md:w-auto h-10">
            <select
              id="type"
              name="type"
              v-model="selectedType"
              class="block w-full md:w-auto h-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 leading-none"
            >
              <option value="">Tous les types</option>
              <option v-for="t in eventTypes" :key="t" :value="t">
                {{ t }}
              </option>
            </select>

            <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                class="h-4 w-4 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
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
          <div class="flex justify-center mt-8">
            <button
              v-if="activityStore.hasMore"
              @click="loadMore"
              :disabled="activityStore.loading"
              class="px-6 py-3 hover:cursor-pointer bg-custom-blue text-custom-white rounded-lg hover:bg-custom-blue-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ activityStore.loading ? "Chargement..." : "Voir plus d'événements" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-custom-blue">
    <div class="container mx-auto">
      <div class="flex flex-col md:flex-row items-center max-w-5xl w-full pt-24 pb-12 px-5 md:px-0">
        <div class="w-full md:w-1/3 flex justify-center mb-8 md:mb-0">
          <div class="relative">
            <img src="/img/icon/1-blue.svg" alt="Créer une partie">
          </div>
        </div>

        <div class="w-full md:w-2/3 flex flex-col items-center md:items-start space-y-4 text-custom-white text-center md:text-left">
          <h2 class="text-3xl md:text-4xl font-bold">
            Envie de jouer à un jeu précis&nbsp;?
          </h2>
          <p class="text-lg opacity-90">
            Créer votre propre événement et laisser des joueurs y participer.
          </p>
          <router-link
            :to="authStore.isLogged ? '/create_event' : '/login'"
            class="text-xl font-bold hover:cursor-pointer hover:bg-custom-green-hover bg-custom-green text-primary px-6 py-3 rounded-2xl"
            >Je crée une partie
          </router-link>
        </div>
      </div>

      <div class="flex flex-col-reverse md:flex-row ml-auto items-center max-w-5xl w-full pt-12 pb-24 px-5 md:px-0">
        
        <div class="w-full md:w-2/3 flex flex-col items-center md:items-end space-y-4 text-custom-white text-center md:text-right">
          <h2 class="text-3xl md:text-4xl font-bold">
            Juste envie de jouer à n'importe quel jeu&nbsp;?
          </h2>
          <p class="text-lg opacity-90">
            Montrer aux joueurs autour de vous que vous êtes disponibles pour jouer à <br class="hidden md:block"/> n'importe quel jeu ou a un certain type de jeu.
          </p>
          <router-link
            :to="authStore.isLogged ? '/create_event' : '/login'"
            class="text-xl font-bold hover:cursor-pointer hover:bg-custom-green-hover bg-custom-green text-primary px-6 py-3 rounded-2xl"
            >Je suis disponible
          </router-link>
        </div>

        <div class="w-full md:w-1/3 flex justify-center mb-8 md:mb-0">
          <div class="relative">
            <img src="/img/icon/2-blue.svg" alt="Se rendre disponible">
          </div>
        </div>
      </div>
    </div>    
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useActivityStore } from "../stores/activityStore";
import ActivityCard from "../components/molecules/ActivityCard.vue";
import FilterBar from "@/components/molecules/FilterBar.vue";
import { useAuth } from "../stores/authStore";
import type { Activity } from "@/types/Activity";
const authStore = useAuth();
const activityStore = useActivityStore();

const searchQuery = ref("");
const selectedDate = ref("");
const selectedCity = ref("");
const selectedType = ref<"" | Activity["type"]>("");

const eventTypes: Activity["type"][] = [
  "Festival",
  "Bars & Soirées",
  "Par des joueurs",
];

const upcomingActivitiesFiltered = computed(() => {
  const type = selectedType.value;
  const upcoming = activityStore.getUpcomingActivities;
  if (!type) return upcoming;
  return upcoming.filter((a) => a.type === type);
});
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
let cityTimeout: ReturnType<typeof setTimeout> | null = null;

const fetchFiltered = (append = false) => {
  const page = append ? activityStore.currentPage + 1 : 1;
  activityStore.fetchActivities(page, append, {
    search: searchQuery.value,
    date: selectedDate.value,
    city: selectedCity.value,
  });
};

const onSearchUpdate = (value: string) => {
  searchQuery.value = value;
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchFiltered(false);
  }, 300);
};

const onDateUpdate = (value: string) => {
  selectedDate.value = value;
  const isValidIsoDate = (s: string) => {
    if (!s) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(s);
    return (
      !isNaN(dt.getTime()) &&
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() + 1 === m &&
      dt.getUTCDate() === d &&
      new Date(y, m - 1, d).getTime() >= new Date().setHours(0, 0, 0, 0)
    );
  };

  if (value !== "" && !isValidIsoDate(value)) {
    selectedDate.value = "";
  }

  fetchFiltered(false);
};

const onCityUpdate = (value: string) => {
  selectedCity.value = value;
  if (cityTimeout) clearTimeout(cityTimeout);
  cityTimeout = setTimeout(() => {
    fetchFiltered(false);
  }, 300);
};

onMounted(() => {
  fetchFiltered(false);
});

const loadMore = () => {
  if (activityStore.loading || !activityStore.hasMore) return;
  fetchFiltered(true);
};
</script>
