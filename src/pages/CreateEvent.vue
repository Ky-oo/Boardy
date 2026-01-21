<template>
  <div class="min-h-screen bg-custom-bg w-full lg:px-50 bloc-cat-create_event">
    <div class="text-center pt-30 pb-8">
      <h1
        v-if="isEditMode"
        class="text-5xl font-family-urban text-primary my-6"
      >
        Editez votre partie
      </h1>
      <div v-else>
        <h1 class="text-5xl font-family-urban text-primary my-6 px-5">
          {{
            isOrganisationHost
              ? "Créer une soirée pour votre établissement"
              : isBoardyHost
                ? "Créer une soirée pour Boardy"
                : "Créer votre partie idéale"
          }}
        </h1>
        <p class="text-primary text-lg font-family-red-hat px-5">
          Avec votre compte joueur vous pouvez organiser une partie pour
          chercher des joueurs.
        </p>
      </div>
    </div>

    <div class="flex justify-center w-full items-start gap-16 px-8 pb-16">
      <div class="relative pt-6 w-full hidden lg:block">
        <img
          src="/img/createEvent/stepper.svg"
          alt="Étapes de création d'événement"
          class="w-full mb-8"
        />
        <img
          src="/img/createEvent/create_event-image.jpg"
          sizes="(min-width: 1024px) 50vw, 100vw"
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
              class="border-[1.5px] hover:cursor-text border-custom-blue w-full h-10 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="date" class="text-primary font-medium">Date*</label>

            <input
              id="date"
              ref="dateInputRef"
              v-model="date"
              type="date"
              :min="todayDate"
              required
              class="w-full h-10 px-4 py-3 hover:cursor-text rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary"
              @input="clearDateValidity"
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
                class="w-full px-4 py-3 h-10 hover:cursor-text border-[1.5px] border-custom-blue rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary"
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
                class="h-10 px-4 py-3 border-[1.5px] hover:cursor-text border-custom-blue rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <p v-if="isOvernight" class="text-xs text-gray-500">
            L'heure de fin est plus tot que l'heure de debut : la soiree dure
            apres minuit.
          </p>

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
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="address" class="text-primary font-medium"
              >Adresse*</label
            >

            <div class="flex gap-2">
              <div class="relative flex-1">
                <input
                  id="address"
                  ref="addressInputRef"
                  v-model="address"
                  type="text"
                  placeholder="Ex : 44 rue de la paix, Paris, 75001 France"
                  required
                  class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary"
                  @input="handleAddressInputWithValidation"
                  @focus="showAddressSuggestions = true"
                  @blur="handleAddressBlur"
                />
                <div
                  v-if="
                    showAddressSuggestions &&
                    (addressLoading ||
                      addressSuggestions.length ||
                      address.trim().length >= 3)
                  "
                  class="absolute left-0 right-0 mt-1 bg-custom-white border border-custom-blue rounded-xl shadow-lg max-h-48 overflow-y-auto z-20"
                >
                  <div
                    v-if="addressLoading"
                    class="px-3 py-2 text-xs text-gray-500"
                  >
                    Recherche adresse...
                  </div>
                  <button
                    v-for="suggestion in addressSuggestions"
                    :key="suggestion.place_id"
                    type="button"
                    class="w-full text-left hover:cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @mousedown.prevent="
                      handleSelectAddressSuggestion(suggestion)
                    "
                  >
                    {{ suggestion.display_name }}
                  </button>
                  <div
                    v-if="
                      !addressLoading &&
                      addressSuggestions.length === 0 &&
                      address.trim().length >= 3
                    "
                    class="px-3 py-2 text-xs text-gray-500"
                  >
                    Aucune adresse trouvee
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="showHomeAddress" class="flex items-start gap-3">
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
              class="w-full px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
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
                class="flex-1 h-10 bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="participants" class="text-primary font-medium">
              Nombre de participants*

              <span class="font-normal text-gray-500">(dont vous)</span>
            </label>

            <div
              class="flex items-center gap-2 border-[1.5px] border-custom-blue focus:border-primary rounded-xl px-4 py-2 w-fit"
            >
              <IconParticipants class="w-5 h-5 text-gray-400 z" />

              <input
                id="participants"
                v-model.number="participants"
                type="number"
                min="2"
                :max="maxParticipants"
                required
                class="w-16 bg-transparent text-gray-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div v-if="showPriceFields" class="flex flex-col gap-2">
            <label class="text-primary font-medium">Tarif*</label>
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-primary">
                <input
                  v-model="priceType"
                  type="radio"
                  name="priceType"
                  value="free"
                  class="w-4 h-4 hover:cursor-pointer accent-custom-blue cursor-pointer"
                  @change="handlePriceTypeChange"
                />
                Gratuit
              </label>
              <label class="flex items-center gap-2 text-sm text-primary">
                <input
                  v-model="priceType"
                  type="radio"
                  name="priceType"
                  value="paid"
                  class="w-4 h-4 hover:cursor-pointer accent-custom-blue cursor-pointer"
                  @change="handlePriceTypeChange"
                />
                Payant
              </label>
              <div class="flex items-center gap-2">
                <input
                  id="price"
                  v-model.number="priceValue"
                  type="number"
                  min="0.01"
                  step="0.01"
                  :disabled="priceType === 'free'"
                  :required="priceType === 'paid'"
                  placeholder="0.00"
                  class="w-24 h-10 px-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-primary disabled:opacity-60"
                />
                <span class="text-sm text-gray-500">EUR</span>
              </div>
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

          <p v-if="organisationName" class="text-primary text-sm">
            Organisé par
            <span class="font-semibold">{{ organisationName }}</span
            >.
          </p>

          <p v-else-if="isBoardyHost" class="text-primary text-sm">
            Organisé par <span class="font-semibold">Boardy</span>.
          </p>

          <p v-else class="text-primary text-sm">
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
              class="h-10 hover:cursor-pointer w-full bg-custom-blue hover:bg-custom-blue-hover text-custom-white font-semibold rounded-xl transition-colors"
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
import { useAuthStore } from "@/stores/authStore";
import IconParticipants from "@/components/atoms/icons/IconParticipants.vue";
import { useActivityStore } from "@/stores/activityStore";
import type { Activity } from "@/types/Activity";
import { useAddressAutocomplete } from "@/utils/addressAutocomplete";
import { useOrganisationStore } from "@/stores/organisationStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const activityStore = useActivityStore();
const organisationStore = useOrganisationStore();

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
const priceType = ref<"free" | "paid">("free");
const priceValue = ref<number | null>(null);
const error = ref("");
const loading = ref(false);
const isEditMode = ref(false);
const editId = ref<number | null>(null);
const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);
const addressInputRef = ref<HTMLInputElement | null>(null);
const dateInputRef = ref<HTMLInputElement | null>(null);
const editOrganisationId = ref<number | null>(null);
const editIsBoardy = ref(false);

const {
  addressSuggestions,
  addressLoading,
  showAddressSuggestions,
  handleAddressInput,
  handleAddressBlur,
  selectAddressSuggestion,
  geocodeLocation,
} = useAddressAutocomplete({
  address,
  location,
  latitude,
  longitude,
});

const clearAddressValidity = () => {
  addressInputRef.value?.setCustomValidity("");
};

const clearDateValidity = () => {
  dateInputRef.value?.setCustomValidity("");
};

const setDateInvalid = (message: string) => {
  if (!dateInputRef.value) return;
  dateInputRef.value.setCustomValidity(message);
  dateInputRef.value.reportValidity();
};

const formatLocalDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayDate = computed(() => formatLocalDate(new Date()));

const isDateBeforeToday = (value: string) => {
  if (!value) return false;
  const selected = new Date(`${value}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
};

const isOvernight = computed(() => {
  if (!startTime.value || !endTime.value) return false;
  return endTime.value < startTime.value;
});

const handleAddressInputWithValidation = () => {
  clearAddressValidity();
  handleAddressInput();
};

const handleSelectAddressSuggestion = (suggestion: any) => {
  clearAddressValidity();
  selectAddressSuggestion(suggestion);
};

const setAddressInvalid = (message: string) => {
  if (!addressInputRef.value) return;
  addressInputRef.value.setCustomValidity(message);
  addressInputRef.value.reportValidity();
};

const handlePriceTypeChange = () => {
  if (priceType.value === "free") {
    priceValue.value = null;
  }
};

const isAdmin = computed(() => authStore.user?.role === "admin");

const boardyQuery = computed(() => {
  const raw = route.query.boardy;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return false;
  return value === "1" || value === "true" || value === "boardy";
});

const routeOrganisationId = computed(() => {
  const raw = route.query.organisationId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const effectiveOrganisationId = computed(
  () => routeOrganisationId.value ?? editOrganisationId.value,
);

const isOrganisationHost = computed(() => !!effectiveOrganisationId.value);

const isBoardyHost = computed(
  () =>
    !isOrganisationHost.value &&
    ((isAdmin.value && boardyQuery.value) || editIsBoardy.value),
);

const showHomeAddress = computed(
  () => !isOrganisationHost.value && !isBoardyHost.value,
);

const showPriceFields = computed(
  () => isOrganisationHost.value || isBoardyHost.value,
);

const maxParticipants = computed(() =>
  boardyQuery.value ? Infinity : editOrganisationId.value ? 100 : 20,
);

const organisationName = computed(() => {
  const id = effectiveOrganisationId.value;
  if (!id) return null;
  return organisationStore.getOrganisationById(id)?.name ?? null;
});

const creatorName = computed(() => {
  const user = authStore.getUser;
  if (user) {
    return `${user.firstname} ${user.lastname?.charAt(0)}.`;
  }
  return "Anonyme";
});

const submitLabel = computed(() =>
  isEditMode.value ? "Mettre à jour l'événement" : "Créez votre événement",
);

const populateForm = (activity: any) => {
  eventTitle.value = activity.title || "";
  description.value = activity.description || "";
  location.value = activity.place_name || "";
  address.value = activity.address || "";
  latitude.value = activity.latitude ?? null;
  longitude.value = activity.longitude ?? null;
  editOrganisationId.value = activity.hostOrganisationId ?? null;
  editIsBoardy.value = activity.hostType === "event";
  isHomeAddress.value = Boolean(activity.homeHost);
  games.value = Array.isArray(activity.gameId)
    ? activity.gameId.join(", ")
    : activity.gameId || "";
  participants.value = activity.seats || 4;
  isPrivate.value = Boolean(activity.private);
  const resolvedPrice =
    activity.price !== null && activity.price !== undefined
      ? Number(activity.price)
      : 0;
  if (resolvedPrice > 0) {
    priceType.value = "paid";
    priceValue.value = resolvedPrice;
  } else {
    priceType.value = "free";
    priceValue.value = null;
  }

  const d = new Date(activity.date);
  if (!isNaN(d.getTime())) {
    date.value = d.toISOString().slice(0, 10);
    startTime.value = d.toLocaleTimeString("fr-FR", {
      hour: "numeric",
      minute: "numeric",
    });
  }
};

const loadOrganisation = async (organisationId: number | null) => {
  if (!organisationId) return;
  try {
    await organisationStore.fetchOrganisation(organisationId);
  } catch (e) {
    console.error("Erreur organisation:", e);
  }
};

onMounted(async () => {
  if (routeOrganisationId.value) {
    await loadOrganisation(routeOrganisationId.value);
  }
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
          if (editOrganisationId.value) {
            await loadOrganisation(editOrganisationId.value);
          }
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
  clearAddressValidity();
  clearDateValidity();
  try {
    if (!authStore.user) {
      throw new Error("Vous devez être connecté pour créer un évènement");
    }

    if (isDateBeforeToday(date.value)) {
      const message = "L'activite doit avoir lieu au plus tot ce soir.";
      setDateInvalid(message);
      error.value = message;
      return;
    }

    const isoDate = new Date(
      `${date.value}T${startTime.value || "00:00"}`,
    ).toISOString();

    const coords = await geocodeLocation();

    if (!coords && (!latitude.value || !longitude.value)) {
      const message = "Adresse introuvable. Verifiez le lieu ou l'adresse.";
      setAddressInvalid(message);
      error.value = message;
      return;
    }

    const payload: Partial<Activity> = {
      title: eventTitle.value,
      description: description.value,
      gameId: null,
      date: isoDate,
      place_name: location.value,
      address: address.value,
      city: authStore.user.city,
      postalCode: "00000",
      latitude: latitude.value,
      longitude: longitude.value,
      seats: participants.value,
      type: "Par des joueurs",
      homeHost: showHomeAddress.value ? isHomeAddress.value : false,
      private: isPrivate.value,
    };

    if (isOrganisationHost.value) {
      payload.hostOrganisationId = effectiveOrganisationId.value;
      payload.hostType = "organisation";
      if (priceType.value === "paid") {
        const numericPrice = Number(priceValue.value);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
          error.value = "Veuillez renseigner un prix valide.";
          return;
        }
        payload.price = numericPrice;
      } else {
        payload.price = 0;
      }
    } else if (isBoardyHost.value) {
      payload.hostUserId = authStore.user.id;
      payload.hostType = "event";
      if (priceType.value === "paid") {
        const numericPrice = Number(priceValue.value);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
          error.value = "Veuillez renseigner un prix valide.";
          return;
        }
        payload.price = numericPrice;
      } else {
        payload.price = 0;
      }
    } else {
      payload.hostUserId = authStore.user.id;
      payload.hostType = "user";
      payload.price = null;
    }

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
