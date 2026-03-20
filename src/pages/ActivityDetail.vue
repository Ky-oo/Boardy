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

      <div v-if="canEdit" class="container mx-auto ">
        <div class="relative m-4 sm:m-0">
        <div class="w-full flex flex-col sm:flex-row sm:justify-end gap-4 sm:gap-3 sm:mb-6">
          <button
            class="px-4 py-2 bg-custom-orange hover:cursor-pointer text-primary rounded-lg hover:bg-custom-orange-hover"
            @click="openGuestModal"
          >
            Ajouter manuellement un utilisateur
          </button>
          <button
            class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover"
            @click="handleEdit"
          >
            Modifier
          </button>
          <button
            class="hidden sm:inline-block px-4 py-2 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600"
            @click="handleDelete"
          >
            Supprimer
          </button>
        </div>
        </div>
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
                >Email (optionnel)</label
              >
              <input
                id="guest-email"
                v-model.trim="guestEmail"
                type="email"
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
            class="px-4 py-2 hover:cursor-pointer bg-custom-white text-custom-primary rounded-lg hover:bg-custom-orange font-bold"
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
                  'text-orange-600': request.status === 'approved',
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
                class="px-4 py-2 hover:cursor-pointer bg-custom-blue text-white rounded-lg hover:bg-custom-blue-hover font-bold"
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

      <div v-if="isParticipating">
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
      </div>

      <div class="container rounded-xl mx-auto relative z-0 bandeau">
        <img
          :src="`/img/home/img-${activityStore.currentActivity.hostType}.png`"
          :alt="activityStore.currentActivity.title"
          class="w-full h-100 object-cover rounded-lg z-10 relative"
        />
      </div>

      <div class="container mx-auto">
        <div
          class="filter-bar mx-5 md:mx-15 mb-35 px-10 py-8 bg-custom-orange rounded-xl"
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
            <div class="w-full lg:w-1/3">
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
                  class="bg-custom-blue text-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-blue-hover font-bold w-full"
                >
                  Connectez-vous pour participer
                </button>
                <button
                  v-else-if="canRequestParticipation"
                  @click="handleParticipate"
                  :disabled="paymentLoading"
                  class="bg-custom-blue text-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-blue-hover font-bold w-full disabled:opacity-60 disabled:cursor-not-allowed"
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
                <div class="bg-custom-orange p-2 rounded-lg me-3">
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
                <li>Rappel envoyé 24h avant l'événement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ActivityDetailMap :activity="activityStore.currentActivity" />

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
      <div v-if="canEdit" class="relative m-8">
        <button
          class="sm:hidden inline-block px-4 py-2 w-full bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600"
          @click="handleDelete"
        >
          Supprimer
        </button>
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
import { useRoute, useRouter } from "vue-router";
import { useActivityStore } from "../stores/activityStore";

import IconPerson from "@/components/atoms/icons/IconPerson.vue";
import ActivityEditButtons from "@/components/organisms/ActivityEditButtons.vue";
import ChatPanel from "@/components/organisms/ChatPanel.vue";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { usePaymentStore } from "@/stores/paymentStore";
import { get as apiGet, post as apiPost } from "@/utils/api/api";
import type {
  ParticipationRequest,
  ParticipationRequestStatus,
} from "@/types/ParticipationRequest";
import ReturnBackButton from "@/components/molecules/button/ReturnBackButton.vue";
import AddGuestModal from "@/components/organisms/modal/AddGuestModal.vue";
import RequestPanel from "@/components/organisms/panel/RequestPanel.vue";
import ActivityInfoBar from "@/components/organisms/ActivityInfoBar.vue";
import ActivityDetailMap from "@/components/molecules/map/ActivityDetailMap.vue";

const route = useRoute();
const router = useRouter();
const activityStore = useActivityStore();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();
const requestStatus = ref<ParticipationRequestStatus | "none">("none");
const requests = ref<ParticipationRequest[]>([]);
const requestsLoading = ref(false);
const showGuestModal = ref(false);
const toastStore = useToastStore();

const guestError = ref("");

const guestLoading = ref(false);

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
  () => isParticipating.value && !isCreator.value,
);

const canEdit = computed(() => {
  if (!authStore.user || !activityStore.currentActivity) return false;
  if (authStore.user.role === "admin") return true;
  return isCreator.value;
});

const canManageRequests = computed(() => {
  if (!activityStore.currentActivity || !authStore.user) return false;
  console.log(authStore.user.role);
  if (authStore.user.role === "admin") return true;
  return isCreator.value;
});

const canAccessChat = computed(
  () => !!authStore.user && (isParticipating.value || isCreator.value),
);

const showRequestPanel = computed(
  () => canManageRequests.value && !!activityStore.currentActivity?.private,
);

const openGuestModal = () => {
  showGuestModal.value = true;
  guestError.value = "";
};

const closeGuestModal = () => {
  showGuestModal.value = false;
  guestError.value = "";
};

const handleAddGuest = async (guestName: string, guestEmail: string) => {
  if (!activityStore.currentActivity) return;

  const name = guestName.trim();
  const email = guestEmail.trim();

  guestLoading.value = true;
  guestError.value = "";

  try {
    const payload: { name: string; email?: string } = { name };
    if (email) {
      payload.email = email;
    }
    await apiPost(
      `/activity/${activityStore.currentActivity.id}/guest`,
      payload,
    );
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
      `/activity/${activityStore.currentActivity.id}/request`,
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
      `/activity/${activityStore.currentActivity.id}/requests`,
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

const approveRequest = async (requestId: number) => {
  if (!activityStore.currentActivity) return;
  try {
    await apiPost(
      `/activity/${activityStore.currentActivity.id}/requests/${requestId}/approve`,
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
      `/activity/${activityStore.currentActivity.id}/requests/${requestId}/reject`,
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

const requestParticipation = async () => {
  if (!activityStore.currentActivity) return;
  try {
    const response = await apiPost(
      `/activity/${activityStore.currentActivity.id}/request`,
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

const handlePaymentConfirm = async (sessionId: string) => {
  if (!sessionId || !activityStore.currentActivity) return;
  const result = await paymentStore.confirmPayment(sessionId);
  if (!result.ok) return;
  try {
    const refreshed = await activityStore.fetchActivity(
      activityStore.currentActivity.id,
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
    "Voulez-vous supprimer cette activité ?",
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
    return `${activityStore.currentActivity.host.pseudo}`;
  } else if (
    activityStore.currentActivity.hostType === "user" &&
    activityStore.currentActivity.homeHost === false &&
    activityStore.currentActivity.host
  ) {
    return `${activityStore.currentActivity.host.pseudo}`;
  } else if (
    activityStore.currentActivity.hostType === "organisation" &&
    activityStore.currentActivity.organisation
  ) {
    return `${activityStore.currentActivity.organisation.name}`;
  } else if (activityStore.currentActivity.hostType === "event") {
    return `Playly`;
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
  },
);
</script>
