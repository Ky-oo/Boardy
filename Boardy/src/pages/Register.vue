<template>
  <div class="min-h-screen bg-white mx-20 bloc-cat-register">
    <div class="text-center pt-30 pb-8">
      <h1 class="text-5xl font-family-urban text-black my-6">
        Créer un compte
      </h1>
      <p class="text-black text-lg font-family-red-hat">
        Créez et participez à des événements avec votre compte Boardy.
      </p>
    </div>

    <div class="flex justify-center items-center gap-16 px-8 pb-16">
      <div class="relative w-full pt-6">
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
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
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
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-white"
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
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-white"
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
              required
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-white"
            />
          </div>

          <div class="flex flex-col gap-2">
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
              class="w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="city" class="text-custom-white font-medium"
              >Ville</label
            >
            <div class="flex gap-2">
              <input
                id="city"
                v-model="city"
                autocomplete="address-level2"
                type="text"
                placeholder="Entrez votre ville"
                required
                class="flex-1 h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-white"
              />
              <button
                type="button"
                @click="getUserLocation"
                :disabled="locationLoading"
                class="flex items-center gap-2 px-4 py-3 h-10 hover:cursor-pointer bg-white text-gray-500 hover:bg-blue-700 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
            <div class="flex-1 h-px bg-white/50"></div>
            <span class="text-custom-white text-sm">Ou continuer avec</span>
            <div class="flex-1 h-px bg-white/50"></div>
          </div>

          <div class="flex justify-center gap-10">
            <button
              type="button"
              class="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <IconGoogle class="text-custom-white w-10 h-10" />
            </button>
            <button
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
            </button>
          </div>

          <div class="flex justify-between mt-4">
            <a
              href="/login"
              @click.prevent="router.push('/login')"
              class="text-custom-white underline hover:no-underline cursor-pointer"
            >
              J'ai déjà un compte
            </a>
            <a
              href="/register-organisation"
              @click.prevent="router.push('/register-organisation')"
              class="text-custom-white underline hover:no-underline cursor-pointer"
            >
              Je suis une entreprise/organisateur
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/stores/authStore";
import IconGoogle from "@/components/atoms/icons/IconGoogle.vue";
import IconApple from "@/components/atoms/icons/IconApple.vue";
import IconFacebook from "@/components/atoms/icons/IconFacebook.vue";

const router = useRouter();
const authStore = useAuth();

const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const city = ref("");
const error = ref("");
const loading = ref(false);
const locationLoading = ref(false);

const getUserLocation = async () => {
  if (!navigator.geolocation) {
    error.value = "La géolocalisation n'est pas supportée par votre navigateur";
    return;
  }

  locationLoading.value = true;
  error.value = "";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
        );

        if (!response.ok) {
          throw new Error("Impossible de récupérer la ville");
        }

        const data = await response.json();

        city.value =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.municipality ||
          "";

        if (!city.value) {
          error.value = "Impossible de déterminer votre ville";
        }
      } catch (e: any) {
        console.error("Fetch error:", e);
        error.value = e.message || "Erreur lors de la récupération de la ville";
      } finally {
        locationLoading.value = false;
      }
    },
    (err) => {
      console.error("Geolocation error:", err);
      locationLoading.value = false;
      if (err.code === 1) {
        error.value = "Vous avez refusé l'accès à votre position";
      } else if (err.code === 2) {
        error.value = "Position non disponible";
      } else if (err.code === 3) {
        error.value = "Délai d'attente dépassé";
      } else {
        error.value = "Erreur lors de la récupération de la position";
      }
    },
    {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 0,
    }
  );
};

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    await authStore.login(email.value, password.value);
  } catch (e: any) {
    error.value = e.message || "Erreur de connexion";
  } finally {
    loading.value = false;
  }
};
</script>
