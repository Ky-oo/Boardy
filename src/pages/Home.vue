<template>
  <div class="container bloc-bandeau text-center rounded-xl mx-auto">
    <h1
      class="text-3xl md:text-5xl mx-5 md:mx-15 text-custom-white pt-14 md:pt-20 font-family-red-hat font-black text-shadow-lg text-left"
    >
      Trouve des événements <br />
      proche de chez toi !
    </h1>
  </div>

  <div class="container mx-auto">
    <div
      class="filter-bar mx-5 md:mx-15 mb-35 px-10 py-8 bg-custom-green rounded-xl"
    >
      <FilterBar
        @update:search="
          (newQuery: string) => {
            searchQuery = newQuery;
            fetchFiltered();
          }
        "
        @update:date="
          (newDate: string) => {
            selectedDate = newDate;
            fetchFiltered();
          }
        "
        @update:city="
          (newCity: string) => {
            selectedCity = newCity;
            fetchFiltered();
          }
        "
      />
    </div>
  </div>

  <ActivityGrid @fetch-filtered="fetchFiltered(true)" />
  <ActivityPanel />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useActivityStore } from "@/stores/activityStore";
import FilterBar from "@/components/molecules/FilterBar.vue";
import ActivityGrid from "@/components/organisms/grid/ActivityGrid.vue";
import ActivityPanel from "@/components/organisms/panel/ActivityPanel.vue";

const activityStore = useActivityStore();

const searchQuery = ref("");
const selectedDate = ref("");
const selectedCity = ref("");

onMounted(() => {
  fetchFiltered();
});

const fetchFiltered = (append = false) => {
  if (activityStore.loading) return;

  const page = append ? activityStore.currentPage + 1 : 1;

  activityStore.fetchActivities(page, append, {
    search: searchQuery.value,
    date: selectedDate.value,
    city: selectedCity.value,
  });
};
</script>
