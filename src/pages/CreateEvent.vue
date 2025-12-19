<template>
  <div class="min-h-screen bg-custom-white mx-50 bloc-cat-create_event">
    <div class="text-center pt-30 pb-8">
      <h1 class="text-5xl font-family-urban text-primary my-6">
        Créer votre partie idéale
      </h1>
      <p class="text-primary text-lg font-family-red-hat">
        Avec votre compte joueur vous pouvez organiser une partie pour chercher
        des joueurs.
      </p>
    </div>

    <div class="flex justify-center w-full items-start gap-16 px-8 pb-16">
      <div class="relative pt-6 w-full">
        <img
          src="/img/createEvent/stepper.png"
          alt="Étapes de création d'événement"
          class="w-full mb-8"
        />
        <img
          src="/img/createEvent/create_event-image.png"
          alt="Personnes jouant à un jeu de société"
          class="relative w-full h-[300px] object-cover rounded-lg z-10"
        />
      </div>

      <div class="z-10 w-full">
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="event-title" class="text-primary font-medium"
              >Titre de l'événements*</label
            >

            <input
              id="event-title"
              v-model="eventTitle"
              type="text"
              placeholder="Ex: soirée Catan, ..."
              required
              class="border-[1.5px] hover:cursor-text border-custom-blue w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="date" class="text-primary font-medium">Date*</label>

            <input
              id="date"
              v-model="date"
              type="date"
              required
              class="w-full h-10 px-4 py-3 hover:cursor-text rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex gap-2 w-full place-content-around">
            <div class="flex flex-col gap-2 w-full">
              <label for="start-time" class="text-primary font-medium"
                >Heure de début*</label
              >

              <input
                id="start-time"
                v-model="startTime"
                type="time"
                placeholder="Entrez votre heure de début"
                required
                class="w-full px-4 py-3 h-10 hover:cursor-text border-[1.5px] border-custom-blue rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
              />
            </div>

            <div class="flex flex-col gap-2 w-full">
              <label for="end-time" class="text-primary font-medium"
                >Heure de fin*</label
              >

              <input
                id="end-time"
                v-model="endTime"
                autocomplete="username"
                type="time"
                placeholder="Entrez votre heure de fin"
                required
                class="h-10 px-4 py-3 border-[1.5px] hover:cursor-text border-custom-blue rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="location" class="text-primary font-medium"
              >Nom du lieu*</label
            >

            <input
              id="location"
              v-model="location"
              type="text"
              placeholder="Ex : Chez Thomas, Bar du coin,..."
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="address" class="text-primary font-medium"
              >Adresse</label
            >

            <div class="flex gap-2">
              <input
                id="address"
                v-model="address"
                type="text"
                placeholder="Ex : 44 rue de la paix, Paris, 75001 France"
                required
                class="flex-1 h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
              />
            </div>
          </div>

          <div class="flex items-start gap-3">
            <input
              id="isHomeAddress"
              v-model="isHomeAddress"
              type="checkbox"
              class="w-5 h-5 mt-1 border-custom-blue accent-custom-blue cursor-pointer"
            />

            <label
              for="isHomeAddress"
              class="text-primary text-sm cursor-pointer"
            >
              <span class="font-semibold"
                >Est-ce l'adresse de votre domicile ?</span
              >

              Si c'est le cas nous cacherons l'adresse précise et la partagerons
              aux participants seulement 24h avant l'événement.
            </label>
          </div>

          <div class="flex flex-col gap-2">
            <label
              for="description"
              class="font-medium text-primary py-1 rounded w-fit"
            >
              Description
            </label>

            <textarea
              id="description"
              v-model="description"
              placeholder="Décrivez l'événement, l'ambiance, les attendus, ce qui est prévu,..."
              rows="4"
              class="w-full px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white resize-none"
            ></textarea>
          </div>

          <div class="flex flex-col gap-2">
            <label for="games" class="text-primary font-medium"
              >Jeux proposés*</label
            >

            <div
              class="flex items-center h-10 gap-2 border-[1.5px] border-custom-blue rounded-xl px-4 py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>

              <input
                id="games"
                v-model="games"
                type="text"
                placeholder="Ex : Catan, Trio, Seven wonders,..."
                class="flex-1 h-10 bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="participants" class="text-primary font-medium">
              Nombre de participants*

              <span class="font-normal text-gray-500">(dont vous)</span>
            </label>

            <div
              class="flex items-center gap-2 border-[1.5px] border-custom-blue rounded-xl px-4 py-2 w-fit"
            >
              <IconParticipants class="w-5 h-5 text-gray-400 z" />

              <input
                id="participants"
                v-model.number="participants"
                type="number"
                min="2"
                max="20"
                required
                class="w-16 bg-transparent text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex items-start gap-3">
            <input
              id="isPrivate"
              v-model="isPrivate"
              type="checkbox"
              class="w-5 h-5 mt-1 rounded border-custom-blue accent-custom-blue cursor-pointer"
            />

            <label for="isPrivate" class="text-primary text-sm cursor-pointer">
              <span class="font-semibold">Votre événement est-il privée ?</span>

              Si oui, vous devrez valider la demande de participation des
              joueurs qui veulent rejoindre votre partie. Si non, vous n'aurez
              pas besoin de valider la demande et ils seront immédiatement
              acceptés.
            </label>
          </div>

          <p class="text-primary text-sm">
            Événement créé par

            <span class="font-semibold">{{ creatorName }}</span
            >.
          </p>

          <!-- Boutons -->

          <div class="flex gap-4 mt-4">
            <button
              type="button"
              @click="router.push('/')"
              class="h-10 w-75 hover:cursor-pointer bg-custom-green hover:bg-custom-green-hover text-gray-800 font-semibold rounded-xl transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="h-10 hover:cursor-pointer w-full bg-custom-blue hover:bg-blue-600 text-custom-white font-semibold rounded-xl transition-colors"
              :disabled="loading"
            >
              {{ loading ? "Enregistrement..." : submitLabel }}
            </button>
          </div>

          <div v-if="error" class="text-red-500 text-sm text-center">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/stores/authStore";
import IconParticipants from "@/components/atoms/icons/IconParticipants.vue";
import { useActivityStore } from "@/stores/activityStore";
import type { Activity } from "@/types/Activity";

const router = useRouter();
const route = useRoute();
const authStore = useAuth();
const activityStore = useActivityStore();

const eventTitle = ref("");
const date = ref("");
const startTime = ref("");
const endTime = ref("");
const location = ref("");
const address = ref("");
const isHomeAddress = ref(false);
const description = ref("");
const games = ref("");
const participants = ref(4);
const isPrivate = ref(false);
const error = ref("");
const loading = ref(false);
const isEditMode = ref(false);
const editId = ref<number | null>(null);

const creatorName = computed(() => {
  const user = authStore.getUser;
  if (user) {
    return `${user.firstname} ${user.lastname?.charAt(0)}.`;
  }
  return "Anonyme";
});

const submitLabel = computed(() =>
  isEditMode.value ? "Mettre à jour l'événement" : "Créez votre événement"
);

const populateForm = (activity: any) => {
  eventTitle.value = activity.title || "";
  description.value = activity.description || "";
  location.value = activity.place_name || "";
  address.value = activity.address || "";
  isHomeAddress.value = Boolean(activity.homeHost);
  games.value = Array.isArray(activity.gameId)
    ? activity.gameId.join(", ")
    : activity.gameId || "";
  participants.value = activity.seats || 4;
  isPrivate.value = Boolean(activity.private);

  const d = new Date(activity.date);
  if (!isNaN(d.getTime())) {
    date.value = d.toISOString().slice(0, 10);
    startTime.value = d.toISOString().slice(11, 16);
  }
};

onMounted(async () => {
  const editParam = route.query.edit as string | undefined;
  if (editParam) {
    const id = Number(editParam);
    if (id) {
      isEditMode.value = true;
      editId.value = id;
      try {
        loading.value = true;
        const activity = await activityStore.fetchActivity(id);
        if (activity) {
          populateForm(activity);
        }
      } catch (e: any) {
        error.value = e.message || "Impossible de charger l'événement";
      } finally {
        loading.value = false;
      }
    }
  }
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";
  try {
    if (!authStore.user) {
      throw new Error("Vous devez être connecté pour créer un évènement");
    }

    const isoDate = new Date(
      `${date.value}T${startTime.value || "00:00"}`
    ).toISOString();

    const payload: Partial<Activity> = {
      title: eventTitle.value,
      description: description.value,
      gameId: null,
      date: isoDate,
      place_name: location.value,
      address: address.value,
      city: authStore.user.city,
      postalCode: "00000",
      seats: participants.value,
      type: "Par des joueurs",
      homeHost: isHomeAddress.value,
      price: null,
      private: isPrivate.value,
      hostUserId: authStore.user.id,
      hostType: "user",
    };

    if (isEditMode.value && editId.value) {
      await activityStore.updateActivity(editId.value, payload);
    } else {
      await activityStore.createActivity(payload);
    }

    router.push("/");
  } catch (e: any) {
    error.value = e.message || "Erreur lors de la création de l'évènement";
  } finally {
    loading.value = false;
  }
};
</script>
