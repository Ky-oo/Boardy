<template>
  <div class="pt-20">
    <div v-if="activityStore.loading" class="text-center py-8">
      <p class="text-gray-600">Chargement de l'activité...</p>
    </div>

    <div v-else-if="activityStore.error" class="text-center py-8">
      <p class="text-red-600">{{ activityStore.error }}</p>
    </div>

    <div v-else-if="activityStore.currentActivity" class="lg:mx-30 py-6">
      <button
        @click="$router.back()"
        class="flex items-center text-custom-primary text-2xl py-3 hover:cursor-pointer mb-6"
      >
        <IconChevronLeft class="mr-2" /> Retour
      </button>

      <div v-if="canEdit" class="flex justify-end gap-3 mb-6">
        <button
          class="px-4 py-2 bg-custom-green hover:cursor-pointer text-primary rounded-lg hover:bg-custom-green-hover"
          @click="openGuestModal"
        >
          Ajouter manuellement un utilisateur
        </button>
        <button
          class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-blue-600"
          @click="handleEdit"
        >
          Modifier
        </button>
        <button
          class="px-4 py-2 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600"
          @click="handleDelete"
        >
          Supprimer
        </button>
      </div>

      <div
        v-if="showGuestModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="closeGuestModal"
      >
        <div class="bg-custom-white rounded-xl p-6 w-full max-w-md shadow-lg">
          <h3 class="text-xl font-bold text-primary mb-4">
            Ajouter un participant externe
          </h3>
          <form @submit.prevent="handleAddGuest">
            <div class="flex flex-col gap-2 mb-3">
              <label for="guest-name" class="text-primary font-medium"
                >Prénom*</label
              >
              <input
                id="guest-name"
                v-model.trim="guestName"
                type="text"
                required
                class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
              />
            </div>
            <div class="flex flex-col gap-2 mb-4">
              <label for="guest-email" class="text-primary font-medium"
                >Email*</label
              >
              <input
                id="guest-email"
                v-model.trim="guestEmail"
                type="email"
                required
                class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
              />
            </div>
            <div v-if="guestError" class="text-red-500 text-sm mb-3">
              {{ guestError }}
            </div>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 bg-gray-200 hover:cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300"
                @click="closeGuestModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="guestLoading"
              >
                {{ guestLoading ? "Ajout..." : "Ajouter" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showRequestPanel" class="bg-custom-blue p-8 rounded-xl mb-10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl text-custom-white font-black">
            Demandes de participation
          </h2>
          <button
            class="px-4 py-2 hover:cursor-pointer bg-custom-white text-custom-primary rounded-lg hover:bg-custom-green font-bold"
            @click="loadRequests"
          >
            Rafraichir
          </button>
        </div>
        <div v-if="requestsLoading" class="text-custom-white">
          Chargement des demandes...
        </div>
        <div v-else-if="requests.length === 0" class="text-custom-white">
          Aucune demande pour le moment.
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="request in requests"
            :key="request.id"
            class="bg-custom-white rounded-lg p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-custom-primary font-bold">
                  {{ request.user?.pseudo || "Utilisateur" }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ request.user?.firstname }} {{ request.user?.lastname }}
                </p>
                <p class="text-sm text-gray-600">{{ request.user?.email }}</p>
              </div>
              <span
                class="text-sm font-semibold"
                :class="{
                  'text-yellow-600': request.status === 'pending',
                  'text-green-600': request.status === 'approved',
                  'text-red-600': request.status === 'rejected',
                }"
              >
                {{ formatRequestStatus(request.status) }}
              </span>
            </div>
            <p v-if="request.payment" class="text-sm text-gray-600 mt-2">
              Paiement: {{ formatPaymentStatus(request.payment?.status) }}
            </p>
            <div v-if="request.status === 'pending'" class="flex gap-2 mt-3">
              <button
                class="px-4 py-2 hover:cursor-pointer bg-custom-blue text-white rounded-lg hover:bg-blue-600 font-bold"
                @click="approveRequest(request.id)"
              >
                Accepter
              </button>
              <button
                class="px-4 py-2 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600 font-bold"
                @click="rejectRequest(request.id)"
              >
                Refuser
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-black text-custom-primary mb-5 mx-5">
        Vous êtes inscrit à cet événement
      </h2>
      <button
        v-if="canCancelParticipation"
        @click="handleCancelParticipation"
        class="mb-10 px-6 py-3 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600 font-bold"
      >
        Annuler ma participation
      </button>

      <div class="container rounded-xl mx-auto relative z-0 bandeau">
        <img
          :src="`/img/home/img-${activityStore.currentActivity.hostType}.png`"
          :alt="activityStore.currentActivity.title"
          class="w-full h-100 object-cover rounded-lg z-10 relative"
        />
      </div>

      <div class="container mx-auto">
        <div
          class="filter-bar mx-5 md:mx-15 mb-35 px-10 py-8 bg-custom-green rounded-xl"
        >
          <h1 class="text-2xl text-primary font-black pb-4">
            {{ activityStore.currentActivity.title }}
          </h1>
          <div class="flex w-full lg:flex-row flex-col">
            <div
              class="w-full lg:w-2/3 border-solid border-b lg:border-b-0 lg:border-r border-custom-blue me-8 pb-6 mb-6 lg:mb-0"
            >
              <div class="flex justify-between pb-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-2 rounded-lg me-3">
                    <IconAgenda class="text-custom-blue w-5 h-5" />
                  </div>
                  <div class="text-primary">
                    <p class="text-sm text-primary">Date</p>
                    {{ formatDate(activityStore.currentActivity.date) }} à
                    {{ formatTime(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <!-- <div class="flex items-center text-xl">
                  {{ formatTime(activityStore.currentActivity.date) }}
                </div> -->
              </div>
              <div class="flex items-start pb-4">
                <div class="bg-custom-white p-2 rounded-lg me-3">
                  <IconNav class="text-custom-blue w-5 h-5" />
                </div>
                <div class="text-primary">
                  <p class="text-sm text-primary">Lieux</p>
                  <div v-if="activityStore.currentActivity.private">
                    Chez {{ getHost }},
                    <br />
                    {{ activityStore.currentActivity.city }}
                  </div>
                  <div v-else>
                    <div class="flex flex-col gap-2">
                      <a
                        v-if="getAddressHref(activityStore.currentActivity)"
                        :href="getAddressHref(activityStore.currentActivity)!"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="underline text-custom-blue hover:no-underline mb-0"
                      >
                        {{ formatShortAddress(activityStore.currentActivity) }}
                      </a>
                      <span v-else class="mb-2">
                        {{ formatShortAddress(activityStore.currentActivity) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- <div v-if="!isParticipating">
                <p>Partager à des amis</p>
                <div class="flex gap-3 mt-2">
                  <a
                    :href="`mailto:?subject=Viens voir cette activité !&body=${encodeURIComponent(pageUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Partager par mail"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconMail class="text-primary w-5 h-5" />
                  </a>
                  <a
                    :href="`https://www.instagram.com/?url=${encodeURIComponent(pageUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Partager sur Instagram"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconInsta class="text-primary w-5 h-5" />
                  </a>
                  <a
                    :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent('Viens voir cette activité ! ' + pageUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Partager sur Facebook"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconFacebook2 class="text-primary w-5 h-5" />
                  </a>
                  <button
                    type="button"
                    @click="copyLink"
                    aria-label="Copier le lien"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconCopy class="text-primary w-5 h-5" />
                  </button>
                </div>
              </div> -->
              <div v-if="isParticipating">
                <div class="flex items-center">
                  <div class="bg-custom-white p-2 rounded-lg me-3">
                    <IconParticipant class="text-custom-blue w-5 h-5" />
                  </div>
                  <div class="text-primary">
                    <p class="text-sm text-primary">Participants</p>
                    {{ participantsCount }} /
                    {{ activityStore.currentActivity.seats }}
                  </div>
                </div>
              </div>
            </div>
            <div class="w-1/3">
              <div v-if="!isParticipating">
                <div class="flex justify-between items-center">
                  <h2 class="text-xl text-primary">Places restantes</h2>
                  <p class="text-primary text-2xl font-black">
                    {{ remainingSeats }} /
                    {{ activityStore.currentActivity.seats }}
                  </p>
                </div>
                <ProgressBar
                  :current="participantsCount"
                  :max="activityStore.currentActivity.seats"
                  class="py-8"
                />
                <button
                  v-if="!authStore.isLogged"
                  @click="$router.push('/login')"
                  class="bg-custom-blue text-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-green font-bold w-full"
                >
                  Connectez-vous pour participer
                </button>
                <button
                  v-else-if="canRequestParticipation"
                  @click="handleParticipate"
                  :disabled="paymentLoading"
                  class="bg-custom-blue text-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-green font-bold w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {{ participateLabel }}
                </button>
                <button
                  v-else-if="isRequestPending"
                  disabled
                  class="bg-gray-400 text-custom-white hover:cursor-pointer px-6 py-3 rounded-lg cursor-not-allowed font-bold w-full"
                >
                  Demande en attente
                </button>
              </div>
              <div v-else>
                <div class="flex justify-between items-center pb-4">
                  <div class="flex items-center gap-2">
                    <div
                      v-for="(digit, index) in daysRemaining"
                      :key="index"
                      class="bg-custom-white text-custom-blue text-4xl font-black w-16 h-16 flex items-center justify-center rounded-lg"
                    >
                      {{ digit }}
                    </div>
                    <p class="text-xl font-black text-custom-blue ml-4">
                      jours avant l'événement
                    </p>
                  </div>
                </div>
                <!-- <div v-if="isParticipating">
                <p>Partager à des amis</p>
                <div class="flex gap-3 mt-2">
                  <a
                    :href="`mailto:?subject=Viens voir cette activité !&body=${encodeURIComponent(pageUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Partager par mail"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconMail class="text-primary w-5 h-5" />
                  </a>
                  <a
                    :href="`https://www.instagram.com/?url=${encodeURIComponent(pageUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Partager sur Instagram"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconInsta class="text-primary w-5 h-5" />
                  </a>
                  <a
                    :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent('Viens voir cette activité ! ' + pageUrl)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Partager sur Facebook"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconFacebook2 class="text-primary w-5 h-5" />
                  </a>
                  <button
                    type="button"
                    @click="copyLink"
                    aria-label="Copier le lien"
                    class="p-2 bg-custom-white rounded-lg"
                  >
                    <IconCopy class="text-primary w-5 h-5" />
                  </button>
                </div>
              </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto">
        <div class="flex lg:flex-row flex-col w-full px-5 md:px-15">
          <div class="w-full lg:w-2/3 pb-4 lg:pb-0">
            <h2 class="text-2xl text-custom-blue">Description</h2>
            <p class="text-lg lg:text-xl text-primary mt-4">
              {{ activityStore.currentActivity.description }}
            </p>
          </div>
          <div class="w-full lg:w-1/3 flex flex-col gap-6 lg:ms-24">
            <div class="card w-full py-4 px-8 rounded-2xl">
              <div class="flex items-center">
                <div class="bg-custom-green p-2 rounded-lg me-3">
                  <IconPerson class="text-custom-blue w-5 h-5" />
                </div>
                <div class="text-primary">
                  <p class="text-sm text-primary">Organisateur</p>
                  {{ getHost }}
                </div>
              </div>
            </div>
            <div class="card w-full py-4 px-8 rounded-2xl">
              <h2 class="text-xl text-custom-blue">Bon à savoir</h2>
              <ul class="list-disc list-inside mt-4 text-md">
                <li>Confirmation immédiate de votre participation</li>
                <li>Rappel envoyé 24h avant l’événement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto pt-8">
        <div class="maps px-5 md:px-15">
          <iframe
            :src="`https://www.google.com/maps?q=${activityStore.currentActivity.latitude},${activityStore.currentActivity.longitude}&hl=fr&z=14&output=embed`"
            width="100%"
            height="300"
            style="border: 0"
            allowfullscreen="false"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="rounded-2xl"
          ></iframe>
        </div>
      </div>

      <div class="container mx-auto">
        <ChatPanel
          v-if="canAccessChat && activityStore.currentActivity"
          :activityId="activityStore.currentActivity.id"
          :user="authStore.user!"
          :token="authStore.tokens?.accessToken || null"
          :participants-ids="activityStore.currentActivity.playersId"
          class="mt-8"
        />
      </div>

      <div class="container mx-auto pb-16 pt-8 px-5">
        <h2 class="text-2xl font-bold mb-6">Événements similaires</h2>

        <div v-if="activityStore.loading" class="text-center py-8">
          <p class="text-gray-600">Chargement des activités...</p>
        </div>

        <div v-else-if="activityStore.error" class="text-center py-8">
          <p class="text-red-600">{{ activityStore.error }}</p>
        </div>

        <div
          v-else-if="activityStore.getSimilarActivities.length === 0"
          class="text-center py-8"
        >
          <p class="text-gray-600">Aucune activité similaire pour le moment.</p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <ActivityCard
            v-for="activity in activityStore.getSimilarActivities"
            :key="activity.id"
            :activity="activity"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600">Activité non trouvée</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";

// const pageUrl = window.location.href;
// const smsUrl = `sms:?body=Viens voir cette activité ! ${pageUrl}`;
// const instagramUrl = `https://www.instagram.com/?url=${encodeURIComponent(pageUrl)}`;
// const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;

// const copyLink = async () => {
//   try {
//     await navigator.clipboard.writeText(pageUrl);
//     alert("Lien copié !");
//   } catch {
//     alert("Impossible de copier le lien.");
//   }
// };
import { useRoute, useRouter } from "vue-router";
import { useActivityStore } from "../stores/activityStore";
import IconChevronLeft from "../components/atoms/icons/IconChevronLeft.vue";
import ProgressBar from "../components/atoms/ProgressBar.vue";
import IconAgenda from "../components/atoms/icons/IconAgenda.vue";
import IconParticipant from "@/components/atoms/icons/IconParticipant.vue";
import IconNav from "@/components/atoms/icons/IconNav.vue";
import IconPerson from "@/components/atoms/icons/IconPerson.vue";
import ActivityCard from "@/components/molecules/ActivityCard.vue";
import ChatPanel from "@/components/organisms/ChatPanel.vue";
import { useAuth } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { confirmPayment, createCheckoutSession } from "@/utils/payment";
import { get as apiGet, post as apiPost } from "@/utils/api/api";
import type {
  ParticipationRequest,
  ParticipationRequestStatus,
} from "@/types/ParticipationRequest";
// import IconMail from "@/components/atoms/icons/IconMail.vue";
// import IconInsta from "@/components/atoms/icons/IconInsta.vue";
// import IconFacebook2 from "@/components/atoms/icons/IconFacebook2.vue";
// import IconCopy from "@/components/atoms/icons/IconCopy.vue";

const route = useRoute();
const router = useRouter();
const activityStore = useActivityStore();
const authStore = useAuth();
const requestStatus = ref<ParticipationRequestStatus | "none">("none");
const requests = ref<ParticipationRequest[]>([]);
const requestsLoading = ref(false);
const paymentLoading = ref(false);
const showGuestModal = ref(false);
const guestName = ref("");
const guestEmail = ref("");
const guestError = ref("");
const guestLoading = ref(false);
const toastStore = useToastStore();
const isPaidActivity = computed(() => priceNumber.value > 0);
const isRequestPending = computed(() => requestStatus.value === "pending");

const isParticipating = computed(() => {
  if (!activityStore.currentActivity || !authStore.user) return false;
  return activityStore.currentActivity.playersId.includes(authStore.user.id);
});

const isCreator = computed(() => {
  if (!activityStore.currentActivity || !authStore.user) return false;
  if (activityStore.currentActivity.hostUserId === authStore.user.id) {
    return true;
  }
  if (activityStore.currentActivity.hostType === "organisation") {
    return (
      activityStore.currentActivity.organisation?.ownerId === authStore.user.id
    );
  }
  return false;
});

const canCancelParticipation = computed(
  () => isParticipating.value && !isCreator.value
);

const canEdit = computed(() => {
  if (!authStore.user || !activityStore.currentActivity) return false;
  if (authStore.user.role === "admin") return true;
  return isCreator.value;
});

const canManageRequests = computed(() => {
  if (!activityStore.currentActivity || !authStore.user) return false;
  if (authStore.user.role === "admin") return true;
  return isCreator.value;
});

const guestCount = computed(
  () => activityStore.currentActivity?.guestUsers?.length ?? 0
);

const participantsCount = computed(() => {
  if (!activityStore.currentActivity) return 0;
  return activityStore.currentActivity.playersId.length + guestCount.value;
});

const remainingSeats = computed(() => {
  if (!activityStore.currentActivity) return 0;
  const seats = Number(activityStore.currentActivity.seats || 0);
  return Math.max(0, seats - participantsCount.value);
});

const canAccessChat = computed(
  () => !!authStore.user && (isParticipating.value || isCreator.value)
);

const showRequestPanel = computed(
  () => canManageRequests.value && !!activityStore.currentActivity?.private
);

const canRequestParticipation = computed(() => {
  if (!activityStore.currentActivity || !authStore.isLogged) return false;
  if (isCreator.value) return false;
  if (isParticipating.value) return false;
  if (requestStatus.value === "pending") return false;
  if (requestStatus.value === "approved") return false;
  return true;
});

const daysRemaining = computed(() => {
  if (!activityStore.currentActivity) return ["0", "0"];
  const now = new Date();
  const eventDate = new Date(activityStore.currentActivity.date);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const days = Math.max(0, diffDays);
  return days.toString().padStart(2, "0").split("");
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "numeric",
    minute: "numeric",
  });
};

const openGuestModal = () => {
  showGuestModal.value = true;
  guestName.value = "";
  guestEmail.value = "";
  guestError.value = "";
};

const closeGuestModal = () => {
  showGuestModal.value = false;
  guestError.value = "";
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const handleAddGuest = async () => {
  if (!activityStore.currentActivity) return;
  const name = guestName.value.trim();
  const email = guestEmail.value.trim();

  if (!name) {
    guestError.value = "Veuillez renseigner un prénom.";
    return;
  }
  if (!email || !isValidEmail(email)) {
    guestError.value = "Veuillez renseigner un email valide.";
    return;
  }

  guestLoading.value = true;
  guestError.value = "";
  try {
    await apiPost(`/activity/${activityStore.currentActivity.id}/guest`, {
      name,
      email,
    });
    await activityStore.fetchActivity(activityStore.currentActivity.id);
    toastStore.addToast("Participant ajouté.", { type: "success" });
    closeGuestModal();
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Impossible d'ajouter le participant.";
    guestError.value = message;
    toastStore.addToast(message, { type: "error" });
  } finally {
    guestLoading.value = false;
  }
};

// const formatPriceValue = (price?: string | number | null) => {
//   const num = price !== null && price !== undefined ? Number(price) : 0;
//   if (!num) return "Gratuit";
//   return `${num.toFixed(2)} €`;
// };

const normalizeAddressDisplay = (value: string) => {
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const secondPart = parts[1] ?? "";
  if (parts.length >= 2 && /^\d/.test(secondPart)) {
    parts.shift();
  }

  const cleaned = parts.filter((p) => {
    const lower = p.toLowerCase();
    if (lower === "france") return false;
    if (lower.includes("france")) return false;
    if (lower.includes("métropolitaine") || lower.includes("metropolitaine")) {
      return false;
    }
    return true;
  });

  const postcodeIndex = cleaned.findIndex((p) => /^\d{5}$/.test(p));
  const postcode =
    postcodeIndex >= 0 ? cleaned.splice(postcodeIndex, 1)[0] : "";

  const kept = cleaned.slice(0, 3);
  if (postcode && !kept.includes(postcode)) {
    kept.push(postcode);
  }

  return kept.join(", ");
};

const removeTrailingCity = (value: string, city: string) => {
  const trimmedCity = city.trim();
  if (!trimmedCity) return value;

  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const last = parts[parts.length - 1];
  if (
    last &&
    last.localeCompare(trimmedCity, undefined, { sensitivity: "base" }) === 0
  ) {
    parts.pop();
  }

  return parts.join(", ");
};

const formatShortAddress = (activity: {
  place_name?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
}) => {
  const address = activity.address?.trim() || "";
  const city = activity.city?.trim() || "";
  const postalCodeRaw = activity.postalCode?.trim() || "";

  const postalCode = postalCodeRaw === "00000" ? "" : postalCodeRaw;

  let addressDisplay = address ? normalizeAddressDisplay(address) : "";
  if (addressDisplay && city) {
    addressDisplay = removeTrailingCity(addressDisplay, city);
  }

  if (addressDisplay) return addressDisplay;

  const parts = [postalCode, city].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return "Adresse indisponible";
};

const getAddressHref = (activity: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  place_name?: string | null;
}) => {
  const lat = activity.latitude;
  const lon = activity.longitude;
  if (typeof lat === "number" && typeof lon === "number") {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }

  const parts = [activity.address]
    .map((p) => p?.trim())
    .filter(Boolean) as string[];

  if (!parts.length) return null;
  const query = encodeURIComponent(parts.join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const priceNumber = computed(() => {
  if (!activityStore.currentActivity) return 0;
  const raw = activityStore.currentActivity.price ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
});

const participateLabel = computed(() => {
  if (paymentLoading.value) {
    return "Redirection vers le paiement...";
  }
  if (activityStore.currentActivity?.private) {
    if (requestStatus.value === "rejected") {
      return "Redemander a rejoindre";
    }
    if (isPaidActivity.value) {
      return `Demander a rejoindre (pre-autorisation ${priceNumber.value.toFixed(
        2
      )} euro)`;
    }
    return "Demander a rejoindre";
  }
  if (isPaidActivity.value) {
    return `Participer pour ${priceNumber.value.toFixed(2)} euro`;
  }
  return "Je participe à l'événement";
});

const formatRequestStatus = (status: ParticipationRequestStatus) => {
  if (status === "pending") return "En attente";
  if (status === "approved") return "Acceptee";
  if (status === "rejected") return "Refusee";
  return status;
};

const formatPaymentStatus = (status?: string | null) => {
  if (!status) return "inconnu";
  if (status === "authorized") return "pre-autorise";
  if (status === "paid") return "paye";
  if (status === "canceled") return "annule";
  if (status === "refunded") return "rembourse";
  return status;
};

const loadRequestStatus = async () => {
  if (!activityStore.currentActivity || !authStore.isLogged) {
    requestStatus.value = "none";
    return;
  }
  if (!activityStore.currentActivity.private) {
    requestStatus.value = "none";
    return;
  }
  try {
    const response = await apiGet(
      `/activity/${activityStore.currentActivity.id}/request`
    );
    const status = response?.status;
    if (
      status === "pending" ||
      status === "approved" ||
      status === "rejected"
    ) {
      requestStatus.value = status;
    } else {
      requestStatus.value = "none";
    }
  } catch (err) {
    console.error("Erreur chargement demande:", err);
  }
};

const loadRequests = async () => {
  if (!activityStore.currentActivity || !showRequestPanel.value) {
    requests.value = [];
    return;
  }
  requestsLoading.value = true;
  try {
    const response = await apiGet(
      `/activity/${activityStore.currentActivity.id}/requests`
    );
    requests.value = Array.isArray(response) ? response : [];
  } catch (err) {
    console.error("Erreur chargement demandes:", err);
  } finally {
    requestsLoading.value = false;
  }
};

const refreshRequestData = async () => {
  await loadRequestStatus();
  if (showRequestPanel.value) {
    await loadRequests();
  } else {
    requests.value = [];
  }
};

const requestParticipation = async () => {
  if (!activityStore.currentActivity) return;
  try {
    const response = await apiPost(
      `/activity/${activityStore.currentActivity.id}/request`
    );
    const status = response?.status;
    requestStatus.value = status || "pending";
    toastStore.addToast("Demande envoyee.", { type: "info" });
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Impossible d'envoyer la demande.";
    toastStore.addToast(message, { type: "error" });
  }
};

const approveRequest = async (requestId: number) => {
  if (!activityStore.currentActivity) return;
  try {
    await apiPost(
      `/activity/${activityStore.currentActivity.id}/requests/${requestId}/approve`
    );
    toastStore.addToast("Demande acceptee.", { type: "success" });
    await activityStore.fetchActivity(activityStore.currentActivity.id);
    await loadRequests();
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Impossible d'accepter la demande.";
    toastStore.addToast(message, { type: "error" });
  }
};

const rejectRequest = async (requestId: number) => {
  if (!activityStore.currentActivity) return;
  try {
    await apiPost(
      `/activity/${activityStore.currentActivity.id}/requests/${requestId}/reject`
    );
    toastStore.addToast("Demande refusee.", { type: "info" });
    await loadRequests();
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Impossible de refuser la demande.";
    toastStore.addToast(message, { type: "error" });
  }
};

const handleParticipate = async () => {
  if (!activityStore.currentActivity) return;
  if (activityStore.currentActivity.private) {
    if (isPaidActivity.value) {
      await startPayment();
    } else {
      await requestParticipation();
    }
    return;
  }
  if (isPaidActivity.value) {
    await startPayment();
    return;
  }
  try {
    const updated = await activityStore.joinActivity(
      activityStore.currentActivity.id
    );
    if (!updated.private) {
      setTimeout(() => {
        router.push("/participation-confirmed");
      }, 500);
    }
  } catch (err) {
    console.error("Erreur lors de la participation:", err);
  }
};

const handleCancelParticipation = async () => {
  if (!activityStore.currentActivity || !authStore.user) return;
  if (isCreator.value) return;
  const confirmed = window.confirm("Voulez-vous annuler votre participation ?");
  if (!confirmed) return;
  try {
    await activityStore.leaveActivity(activityStore.currentActivity.id);
    await refreshRequestData();
    toastStore.addToast("Participation annulee.", { type: "info" });
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Impossible d'annuler la participation.";
    toastStore.addToast(message, { type: "error" });
  }
};

const startPayment = async () => {
  if (!activityStore.currentActivity) return;
  paymentLoading.value = true;
  try {
    const response = await createCheckoutSession(
      activityStore.currentActivity.id
    );
    window.location.href = response.url;
  } catch (err: any) {
    const message =
      err?.response?.data?.error || err?.message || "Erreur lors du paiement.";
    toastStore.addToast(message, { type: "error" });
    if (
      message === "Payment already started" ||
      message === "Request already pending"
    ) {
      await loadRequestStatus();
    }
  } finally {
    paymentLoading.value = false;
  }
};

const handlePaymentConfirm = async (sessionId: string) => {
  if (!sessionId || !activityStore.currentActivity) return;
  paymentLoading.value = true;
  try {
    await confirmPayment(sessionId);
    const refreshed = await activityStore.fetchActivity(
      activityStore.currentActivity.id
    );
    if (refreshed?.private) {
      await loadRequestStatus();
      toastStore.addToast("Demande envoyee.", { type: "info" });
    } else {
      router.push("/participation-confirmed");
      toastStore.addToast("Paiement confirme.", { type: "success" });
    }
    const nextQuery = { ...route.query };
    delete nextQuery.session_id;
    delete nextQuery.payment;
    router.replace({ query: nextQuery });
  } catch (err: any) {
    const message =
      err?.response?.data?.error || err?.message || "Paiement non confirme.";
    toastStore.addToast(message, { type: "error" });
  } finally {
    paymentLoading.value = false;
  }
};

const handleEdit = () => {
  if (!activityStore.currentActivity) return;
  router.push({
    path: "/create_event",
    query: { edit: activityStore.currentActivity.id.toString() },
  });
};

const handleDelete = async () => {
  if (!activityStore.currentActivity) return;
  const confirmDelete = window.confirm(
    "Voulez-vous supprimer cette activité ?"
  );
  if (!confirmDelete) return;
  await activityStore.deleteActivity(activityStore.currentActivity.id);
  router.push("/");
};

const getHost = computed(() => {
  if (!activityStore.currentActivity) return "";

  if (
    activityStore.currentActivity.homeHost === true &&
    activityStore.currentActivity.host
  ) {
    return `${activityStore.currentActivity.host.firstname}`;
  } else if (
    activityStore.currentActivity.hostType === "user" &&
    activityStore.currentActivity.homeHost === false &&
    activityStore.currentActivity.host
  ) {
    return `${activityStore.currentActivity.host.firstname}`;
  } else if (
    activityStore.currentActivity.hostType === "organisation" &&
    activityStore.currentActivity.organisation
  ) {
    return `${activityStore.currentActivity.organisation.name}`;
  } else if (activityStore.currentActivity.hostType === "event") {
    return `Boardy`;
  }
  return "";
});

onMounted(async () => {
  const id = Number(route.params.id);
  if (id) {
    if (activityStore.activities.length === 0) {
      await activityStore.fetchActivities();
    }
    await activityStore.fetchActivity(id);
    const sessionId =
      typeof route.query.session_id === "string"
        ? route.query.session_id
        : null;
    const paymentStatus =
      typeof route.query.payment === "string" ? route.query.payment : null;
    if (sessionId) {
      await handlePaymentConfirm(sessionId);
    } else if (paymentStatus === "cancel") {
      toastStore.addToast("Paiement annule.", { type: "info" });
      const nextQuery = { ...route.query };
      delete nextQuery.payment;
      router.replace({ query: nextQuery });
    }
    await refreshRequestData();
  }
});

watch(
  () => route.params.id,
  async (newId) => {
    const id = Number(newId);
    if (id) {
      requestStatus.value = "none";
      requests.value = [];
      if (activityStore.activities.length === 0) {
        await activityStore.fetchActivities();
      }
      await activityStore.fetchActivity(id);
      await refreshRequestData();
      window.scrollTo(0, 0);
    }
  }
);
</script>
