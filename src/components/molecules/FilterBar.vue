<template>
  <div class="flex flex-col gap-4 rounded-xl md:grid md:grid-cols-2 xl:flex xl:flex-row xl:items-start">
    <!-- Champ de recherche avec loupe -->
    <div class="w-full md:col-span-2 xl:flex-1">
      <label
        for="filter-search"
        class="mb-1 block text-sm font-bold text-primary"
      >
        Recherche
      </label>
      <div class="relative">
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
          id="filter-search"
          v-model="searchQuery"
          type="text"
          placeholder="Je cherche un jeux, un événement..."
          class="bg-custom-white w-full pl-12 pr-4 py-2 border border-custom-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-primary"
          @input="$emit('update:search', searchQuery)"
        />
      </div>
    </div>

    <!-- Sélecteur de date -->
    <div class="w-full xl:w-auto">
      <label for="filter-date" class="mb-1 block text-sm font-bold text-primary">
        Date
      </label>
      <div class="relative">
        <input
          id="filter-date"
          v-model="selectedDate"
          type="date"
          :min="minDate"
          class="bg-custom-white w-full xl:w-48 px-4 py-2 border border-custom-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
          @change="$emit('update:date', selectedDate)"
        />
      </div>
    </div>

    <!-- Recherche de villes -->
    <div class="w-full xl:w-auto">
      <label for="filter-city" class="mb-1 block text-sm font-bold text-primary">
        Ville
      </label>
      <div class="relative">
        <input
          id="filter-city"
          v-model="selectedCity"
          type="text"
          placeholder="Toutes les villes"
          class="bg-custom-white w-full xl:w-64 px-4 py-2 border border-custom-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-primary pr-10"
          @focus="showCitySuggestions = true"
          @blur="handleCityBlur"
        />

        <div
          v-if="
            showCitySuggestions &&
            (cityLoading ||
              citySuggestions.length ||
              selectedCity.trim().length >= 2)
          "
          class="absolute left-0 right-0 mt-1 bg-custom-white border border-custom-blue rounded-xl shadow-lg max-h-48 overflow-y-auto z-20"
        >
          <div v-if="cityLoading" class="px-3 py-2 text-xs text-gray-500">
            Recherche ville...
          </div>
          <button
            v-for="suggestion in citySuggestions"
            :key="suggestion.place_id"
            type="button"
            class="w-full text-left hover:cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @mousedown.prevent="selectCitySuggestion(suggestion)"
          >
            {{ getCityLabel(suggestion) }}
          </button>
          <div
            v-if="
              !cityLoading &&
              citySuggestions.length === 0 &&
              selectedCity.trim().length >= 2
            "
            class="px-3 py-2 text-xs text-gray-500"
          >
            Aucune ville trouvee
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton localisation auto -->
    <div class="w-full md:col-span-2 xl:w-auto xl:shrink-0">
      <span class="hidden xl:block xl:invisible mb-1 text-sm font-bold text-primary">
        Localisation
      </span>
      <button
        @click="handleAutoLocation"
        :disabled="locationLoading"
        class="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-primary transition-colors font-bold whitespace-nowrap hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useToastStore } from "@/stores/toastStore";
import {
  fetchAddressSuggestions,
  type AddressSuggestion,
} from "@/utils/api/geocoding";
import { getUserLocation, UserLocationError } from "@/utils/userLocation";

const emit = defineEmits([
  "update:search",
  "update:date",
  "update:city",
  "auto-location",
]);

const searchQuery = ref("");
const selectedDate = ref("");
const selectedCity = ref("");
const pad2 = (n: number) => String(n).padStart(2, "0");
const formatLocalDateInputValue = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const minDate = ref(formatLocalDateInputValue(new Date()));
const citySuggestions = ref<AddressSuggestion[]>([]);
const cityLoading = ref(false);
const showCitySuggestions = ref(false);
const isCityValid = ref(false);
const lastConfirmedCity = ref("");
const locationLoading = ref(false);

const toastStore = useToastStore();

let citySearchTimeout: number | null = null;
let lastCityQuery = "";

const getCityName = (suggestion: AddressSuggestion) =>
  suggestion.address?.city ||
  suggestion.address?.town ||
  suggestion.address?.village ||
  suggestion.address?.municipality ||
  suggestion.address?.county ||
  suggestion.address?.state ||
  suggestion.display_name.split(",")[0]?.trim() ||
  "";

const getCityLabel = (suggestion: AddressSuggestion) => {
  const name = getCityName(suggestion);
  return name || suggestion.display_name;
};

const fetchCitySuggestions = async (raw: string) => {
  const query = raw.trim();
  if (!query) {
    lastCityQuery = "";
    citySuggestions.value = [];
    cityLoading.value = false;
    return;
  }

  lastCityQuery = query;
  cityLoading.value = true;

  try {
    const results = await fetchAddressSuggestions(query, 6);
    if (lastCityQuery !== query) return;
    const unique = new Map<string, AddressSuggestion>();
    results.forEach((result) => {
      const name = getCityName(result);
      if (!name) return;
      if (!unique.has(name)) {
        unique.set(name, result);
      }
    });
    citySuggestions.value = Array.from(unique.values());
  } catch {
    if (lastCityQuery === query) {
      citySuggestions.value = [];
    }
  } finally {
    if (lastCityQuery === query) {
      cityLoading.value = false;
    }
  }
};

watch(
  () => selectedCity.value,
  () => {
    showCitySuggestions.value = true;
    const trimmed = selectedCity.value.trim();

    if (!trimmed) {
      if (lastConfirmedCity.value) {
        emit("update:city", "");
      }
      isCityValid.value = true;
      lastConfirmedCity.value = "";
      lastCityQuery = "";
      citySuggestions.value = [];
      cityLoading.value = false;
      return;
    }

    if (trimmed !== lastConfirmedCity.value) {
      if (isCityValid.value) {
        emit("update:city", "");
      }
      isCityValid.value = false;
    }

    if (citySearchTimeout !== null) {
      window.clearTimeout(citySearchTimeout);
    }

    if (trimmed.length < 2) {
      lastCityQuery = "";
      citySuggestions.value = [];
      cityLoading.value = false;
      return;
    }

    citySearchTimeout = window.setTimeout(() => {
      fetchCitySuggestions(selectedCity.value);
    }, 300);
  }
);

const handleCityBlur = () => {
  window.setTimeout(() => {
    showCitySuggestions.value = false;
    if (isCityValid.value) return;
    const trimmed = selectedCity.value.trim();
    if (!trimmed) return;
    const match = citySuggestions.value.find(
      (suggestion) =>
        getCityName(suggestion).toLowerCase() === trimmed.toLowerCase()
    );
    if (match) {
      selectCitySuggestion(match);
    }
  }, 150);
};

const selectCitySuggestion = (suggestion: AddressSuggestion) => {
  const name = getCityName(suggestion) || suggestion.display_name;
  selectedCity.value = name;
  isCityValid.value = true;
  lastConfirmedCity.value = name;
  citySuggestions.value = [];
  cityLoading.value = false;
  showCitySuggestions.value = false;
  emit("update:city", selectedCity.value.trim());
};

const getLocationErrorMessage = (err: unknown) => {
  if (err instanceof UserLocationError) {
    switch (err.code) {
      case "permission_denied":
        return "Vous avez refusé l'accès à votre position";
      case "position_unavailable":
        return "Position non disponible";
      case "timeout":
        return "Délai d'attente dépassé";
      case "city_not_found":
        return "Impossible de déterminer votre ville";
      case "reverse_geocode_failed":
        return "Impossible de récupérer la ville";
      case "unsupported":
        return "La géolocalisation n'est pas supportée par votre navigateur";
      default:
        return "Erreur lors de la récupération de la position";
    }
  }
  return "Erreur lors de la récupération de la position";
};

const handleAutoLocation = async () => {
  if (locationLoading.value) return;
  locationLoading.value = true;
  try {
    const { city } = await getUserLocation({
      language: "fr",
      geolocation: { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 },
    });
    selectedCity.value = city;
    isCityValid.value = true;
    lastConfirmedCity.value = city;
    citySuggestions.value = [];
    showCitySuggestions.value = false;
    emit("update:city", selectedCity.value);
    emit("auto-location");
  } catch (err) {
    console.error("Auto location error:", err);
    toastStore.addToast(getLocationErrorMessage(err), { type: "error" });
  } finally {
    locationLoading.value = false;
  }
};
</script>
