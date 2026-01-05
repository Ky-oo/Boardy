<template>
  <div class="min-h-screen bg-custom-bg mx-4 bloc-cat-register sm:mx-20">
    <div class="text-center pt-30 pb-8">
      <h1 class="text-5xl font-family-urban text-primary my-6">
        Créer un compte
      </h1>
      <p class="text-primary text-lg font-family-red-hat">
        Créez et participez à des événements avec votre compte Boardy.
      </p>
    </div>

    <div class="flex justify-center items-center gap-16 px-2 pb-16 xs:px-8">
      <div class="relative w-full pt-6 hidden lg:block">
        <div
          class="absolute -top-1 -right-6 w-full h-full border-2 border-red-500 rounded-lg"
        ></div>
        <img
          src="/img/login/login_image.png"
          alt="Personnes jouant à un jeu de société"
          class="relative w-full h-[400px] object-cover rounded-lg z-10"
        />
      </div>

      <div class="bg-custom-blue rounded-3xl p-8 w-full z-10">
        <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="lastname" class="text-custom-white font-medium"
              >Nom</label
            >
            <input
              id="lastname"
              v-model="lastname"
              autocomplete="family-name"
              type="text"
              placeholder="Entrez votre nom"
              required
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="firstname" class="text-custom-white font-medium"
              >Prénom</label
            >
            <input
              id="firstname"
              v-model="firstname"
              autocomplete="given-name"
              type="text"
              placeholder="Entrez votre prénom"
              required
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="pseudo" class="text-custom-white font-medium"
              >Pseudo</label
            >
            <input
              id="pseudo"
              v-model="pseudo"
              autocomplete="nickname"
              type="text"
              placeholder="Choisissez un pseudo"
              required
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="email" class="text-custom-white font-medium"
              >Email</label
            >
            <input
              id="email"
              v-model="email"
              autocomplete="username"
              type="email"
              placeholder="Entrez votre email"
              :disabled="isGoogleRegistration"
              required
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>

          <div v-if="!isGoogleRegistration" class="flex flex-col gap-2">
            <label for="password" class="text-custom-white font-medium"
              >Mot de passe</label
            >
            <input
              id="password"
              v-model="password"
              autocomplete="current-password"
              type="password"
              placeholder="Entrez votre mot de passe"
              required
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="city" class="text-custom-white font-medium"
              >Ville</label
            >
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input
                  id="city"
                  ref="cityInputRef"
                  v-model="city"
                  autocomplete="address-level2"
                  type="text"
                  placeholder="Entrez votre ville"
                  required
                  class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
                  @input="handleCityInput"
                  @focus="showCitySuggestions = true"
                  @blur="handleCityBlur"
                />
                <div
                  v-if="
                    showCitySuggestions &&
                    (cityLoading ||
                      citySuggestions.length ||
                      city.trim().length >= 2)
                  "
                  class="absolute left-0 right-0 mt-1 bg-custom-white border border-custom-blue rounded-xl shadow-lg max-h-48 overflow-y-auto z-20"
                >
                  <div
                    v-if="cityLoading"
                    class="px-3 py-2 text-xs text-gray-500"
                  >
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
                      city.trim().length >= 2
                    "
                    class="px-3 py-2 text-xs text-gray-500"
                  >
                    Aucune ville trouvee
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="getUserLocation"
                :disabled="locationLoading"
                class="flex items-center gap-2 px-4 py-3 h-10 hover:cursor-pointer bg-custom-white text-gray-500 hover:bg-blue-700 hover:text-custom-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="Utiliser ma position"
              >
                <svg
                  v-if="!locationLoading"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{{
                  locationLoading ? "Chargement..." : "Trouver ma position"
                }}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="w-full h-10 mt-4 hover:cursor-pointer hover:bg-custom-green-hover text-gray-800 font-semibold rounded-xl bg-custom-green transition-colors"
            :disabled="loading"
          >
            {{ loading ? "Création en cours..." : "Créer mon compte" }}
          </button>

          <div v-if="error" class="text-red-200 text-sm text-center">
            {{ error }}
          </div>

          <div class="flex items-center gap-4 mt-2">
            <div class="flex-1 h-px bg-custom-white/50"></div>
            <span class="text-custom-white text-sm">Ou continuer avec</span>
            <div class="flex-1 h-px bg-custom-white/50"></div>
          </div>

          <div class="flex justify-center gap-6 flex-wrap">
            <div
              ref="googleButtonRef"
              class="flex items-center justify-center"
            ></div>
            <!-- <button
              type="button"
              class="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <IconApple class="text-custom-white w-10 h-10" />
            </button>
            <button
              type="button"
              class="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <IconFacebook class="text-custom-white w-10 h-10" />
            </button> -->
          </div>

          <div class="flex justify-between mt-4">
            <a
              href="/login"
              @click.prevent="router.push('/login')"
              class="text-custom-white underline hover:no-underline cursor-pointer"
            >
              J'ai déjà un compte
            </a>
            <!-- <a
              href="/register-organisation"
              @click.prevent="router.push('/register-organisation')"
              class="text-custom-white underline hover:no-underline cursor-pointer"
            >
              Je suis une entreprise/organisateur
            </a> -->
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/stores/authStore";
// import IconApple from "@/components/atoms/icons/IconApple.vue";
// import IconFacebook from "@/components/atoms/icons/IconFacebook.vue";
import {
  fetchAddressSuggestions,
  type AddressSuggestion,
} from "@/utils/api/geocoding";
import {
  consumeGooglePrefill,
  initGoogleButton,
  type GoogleCredentialResponse,
  type GoogleProfile,
} from "@/utils/googleAuthFlow";
import {
  getUserLocation as fetchUserLocation,
  UserLocationError,
} from "@/utils/userLocation";

const router = useRouter();
const authStore = useAuth();

const firstname = ref("");
const lastname = ref("");
const pseudo = ref("");
const email = ref("");
const password = ref("");
const city = ref("");
const cityInputRef = ref<HTMLInputElement | null>(null);
const citySuggestions = ref<AddressSuggestion[]>([]);
const cityLoading = ref(false);
const showCitySuggestions = ref(false);
const isCityValid = ref(false);
const lastConfirmedCity = ref("");
const error = ref("");
const loading = ref(false);
const locationLoading = ref(false);
const googleButtonRef = ref<HTMLDivElement | null>(null);
const googleIdToken = ref<string | null>(null);

const isGoogleRegistration = computed(() => !!googleIdToken.value);
let citySearchTimeout: number | null = null;
let lastCityQuery = "";

const applyGoogleProfile = (profile?: GoogleProfile) => {
  if (!profile) return;
  if (profile.firstname) firstname.value = profile.firstname;
  if (profile.lastname) lastname.value = profile.lastname;
  if (profile.email) email.value = profile.email;
  if (!pseudo.value && profile.email) {
    pseudo.value = profile.email.split("@")[0] || "";
  }
};

const clearCityValidity = () => {
  cityInputRef.value?.setCustomValidity("");
};

const setCityInvalid = (message: string) => {
  if (!cityInputRef.value) return;
  cityInputRef.value.setCustomValidity(message);
  cityInputRef.value.reportValidity();
};

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

const handleCityInput = () => {
  clearCityValidity();
  showCitySuggestions.value = true;
  const trimmed = city.value.trim();

  if (!trimmed) {
    isCityValid.value = true;
    lastConfirmedCity.value = "";
    lastCityQuery = "";
    citySuggestions.value = [];
    cityLoading.value = false;
    return;
  }

  if (trimmed !== lastConfirmedCity.value) {
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
    fetchCitySuggestions(trimmed);
  }, 300);
};

const handleCityBlur = () => {
  window.setTimeout(() => {
    showCitySuggestions.value = false;
    if (isCityValid.value) return;
    const trimmed = city.value.trim();
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
  city.value = name;
  isCityValid.value = true;
  lastConfirmedCity.value = name;
  citySuggestions.value = [];
  cityLoading.value = false;
  showCitySuggestions.value = false;
  clearCityValidity();
};

const validateCity = async () => {
  const trimmed = city.value.trim();
  if (!trimmed) {
    const message = "Veuillez renseigner une ville.";
    setCityInvalid(message);
    error.value = message;
    return false;
  }

  if (isCityValid.value && trimmed === lastConfirmedCity.value) {
    return true;
  }

  cityLoading.value = true;
  try {
    const results = await fetchAddressSuggestions(trimmed, 5);
    const cityResults = results.filter((suggestion) => getCityName(suggestion));
    const match = cityResults.find(
      (suggestion) =>
        getCityName(suggestion).toLowerCase() === trimmed.toLowerCase()
    );
    const candidate = match || cityResults[0];
    if (!candidate) {
      const message = "Ville introuvable. Choisissez une ville valide.";
      setCityInvalid(message);
      error.value = message;
      return false;
    }
    selectCitySuggestion(candidate);
    return true;
  } catch (err) {
    console.error("City lookup error:", err);
    const message = "Impossible de valider la ville.";
    setCityInvalid(message);
    error.value = message;
    return false;
  } finally {
    cityLoading.value = false;
  }
};

const getLocationErrorMessage = (err: unknown) => {
  if (err instanceof UserLocationError) {
    switch (err.code) {
      case "unsupported":
        return "La géolocalisation n'est pas supportée par votre navigateur";
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
      default:
        return "Erreur lors de la récupération de la position";
    }
  }
  return "Erreur lors de la récupération de la position";
};

const getUserLocation = async () => {
  locationLoading.value = true;
  error.value = "";
  try {
    const { city: resolvedCity } = await fetchUserLocation({
      language: "fr",
      geolocation: { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 },
    });
    city.value = resolvedCity;
    isCityValid.value = true;
    lastConfirmedCity.value = resolvedCity;
    showCitySuggestions.value = false;
    citySuggestions.value = [];
    clearCityValidity();
  } catch (err) {
    console.error("User location error:", err);
    error.value = getLocationErrorMessage(err);
  } finally {
    locationLoading.value = false;
  }
};

const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
  try {
    const result = await authStore.handleGoogleAuth(response.credential, {
      redirectOnSuccess: true,
    });
    if (result.needsCompletion) {
      googleIdToken.value = response.credential;
      applyGoogleProfile(result.profile);
    }
  } catch (e: any) {
    error.value = e.message || "Erreur de connexion Google";
  }
};

const handleRegister = async () => {
  loading.value = true;
  error.value = "";
  try {
    clearCityValidity();
    const isValidCity = await validateCity();
    if (!isValidCity) return;

    if (googleIdToken.value) {
      await authStore.completeGoogleRegistration({
        idToken: googleIdToken.value,
        firstname: firstname.value,
        lastname: lastname.value,
        pseudo: pseudo.value,
        city: city.value,
      });
    } else {
      await authStore.register(
        firstname.value,
        lastname.value,
        pseudo.value,
        email.value,
        password.value,
        city.value
      );
    }
  } catch (e: any) {
    error.value = e.message || "Erreur d'inscription";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const prefill = consumeGooglePrefill();
  if (prefill?.idToken) {
    googleIdToken.value = prefill.idToken;
    applyGoogleProfile(prefill.profile);
  }
  initGoogleButton({
    element: googleButtonRef.value,
    onCredential: handleGoogleCredential,
    onError: () => {
      error.value = "Impossible de charger Google Auth";
    },
  });
});
</script>
