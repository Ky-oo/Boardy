<template>
  <div class="flex items-center gap-4 rounded-xl">
    <!-- Champ de recherche avec loupe -->
    <div class="relative flex-1">
      <div class="absolute left-4 top-1/2 -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5 text-custom-primary"
        >
          <path
            fill-rule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Je cherche un jeux, un événement..."
        class="w-full pl-12 pr-4 py-2 border border-custom-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-primary"
        @input="$emit('update:search', searchQuery)"
      />
    </div>

    <!-- Sélecteur de date -->
    <div class="relative">
      <input
        v-model="selectedDate"
        type="date"
        class="px-4 py-2 border border-custom-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
        @change="$emit('update:date', selectedDate)"
      />
    </div>

    <!-- Dropdown des villes -->
    <div class="relative">
      <select
        v-model="selectedCity"
        class="px-4 py-2 border border-custom-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer appearance-none pr-10"
        @change="$emit('update:city', selectedCity)"
      >
        <option value="0">Toutes les villes</option>
        <option value="Lyon">Lyon</option>
        <option value="Annecy">Annecy</option>
        <option value="Grenoble">Grenoble</option>
        <option value="Chambery">Chambery</option>
        <option value="Thonons-les-bains">Thonons-les-bains</option>
        <option value="Les Clefs">Les Clefs</option>
      </select>
      <div
        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-5 h-5 text-custom-primary"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- Bouton localisation auto -->
    <button
      @click="$emit('auto-location')"
      class="flex items-center gap-2 px-6 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-primary transition-colors font-bold whitespace-nowrap hover:cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-5 h-5"
      >
        <path
          fill-rule="evenodd"
          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
          clip-rule="evenodd"
        />
      </svg>
      Localisation auto
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const searchQuery = ref("");
const selectedDate = ref("");
const selectedCity = ref("0");

defineEmits(["update:search", "update:date", "update:city", "auto-location"]);
</script>
