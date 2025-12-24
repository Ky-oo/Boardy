<template>
  <div class="pt-30">
    <div v-if="activityStore.loading" class="text-center py-8">
      <p class="text-gray-600">Chargement de l'activité...</p>
    </div>

    <div v-else-if="activityStore.error" class="text-center py-8">
      <p class="text-red-600">{{ activityStore.error }}</p>
    </div>

    <div v-else-if="activityStore.currentActivity" class="mx-30 py-6">
      <button
        @click="$router.back()"
        class="flex items-center text-custom-primary text-2xl py-3 hover:cursor-pointer mb-6"
      >
        <IconChevronLeft class="mr-2" /> Retour
      </button>

      <div v-if="canEdit" class="flex justify-end gap-3 mb-6">
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

      <div v-if="!isParticipating">
        <div class="green-bloc grid grid-cols-2 gap-24 mb-16">
          <div class="red-border">
            <img
              :src="`/img/home/img-${activityStore.currentActivity.hostType}.png`"
              :alt="activityStore.currentActivity.title"
              class="w-full h-full object-cover rounded-lg z-10 relative"
            />
          </div>
          <div class="flex flex-col gap-6 h-full">
            <div class="bg-custom-red p-8 rounded-xl flex-1">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-black text-custom-white">
                  Places restantes
                </h2>
                <p class="text-custom-white text-2xl font-black">
                  {{
                    activityStore.currentActivity.seats -
                    activityStore.currentActivity.playersId.length
                  }}
                </p>
              </div>
              <ProgressBar
                :current="activityStore.currentActivity.playersId.length"
                :max="activityStore.currentActivity.seats"
                class="py-8"
              />
              <button
                v-if="!authStore.isLogged"
                @click="$router.push('/login')"
                class="bg-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-green font-bold w-full"
              >
                Connectez-vous pour participer
              </button>
              <button
                v-else-if="canRequestParticipation"
                @click="handleParticipate"
                :disabled="paymentLoading"
                class="bg-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-green font-bold w-full disabled:opacity-60 disabled:cursor-not-allowed"
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

            <div class="bg-custom-blue p-8 rounded-xl flex-1">
              <h2 class="text-2xl font-black text-custom-white mb-4">
                Bon à savoir
              </h2>

              <ul class="text-custom-white list-disc list-inside space-y-2">
                <li>Confirmation immédiate de votre participation</li>
                <li>Rappel envoyé 24h avant l’événement</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-custom-blue p-8 rounded-xl mb-6">
          <div class="grid grid-cols-2 gap-24">
            <div class="div">
              <h2 class="text-2xl text-custom-white font-black">
                {{ activityStore.currentActivity.title }}
              </h2>
              <p class="text-xl text-custom-white mt-4">
                {{ activityStore.currentActivity.description }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-24">
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconAgenda class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Date</p>
                    {{ formatDate(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconParticipant class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Participants</p>
                    {{ activityStore.currentActivity.playersId.length }} /
                    {{ activityStore.currentActivity.seats }}
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconNav class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Lieux</p>
                    <div v-if="activityStore.currentActivity.private">
                      Chez {{ getHost }},
                      <br />
                      {{ activityStore.currentActivity.city }}
                    </div>
                    <div v-else>
                      {{ formatShortAddress(activityStore.currentActivity) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconTime class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Heure</p>
                    {{ formatTime(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconDollar class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Prix</p>
                    {{ formatPriceValue(activityStore.currentActivity.price) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconPerson class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Organisateur</p>
                    {{ getHost }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-24 mb-16">
          <div class="bg-custom-green rounded-2xl p-8">
            <h2 class="text-2xl text-custom-primary mb-4">Localisation</h2>
            <iframe
              :src="`https://www.google.com/maps?q=${activityStore.currentActivity.latitude},${activityStore.currentActivity.longitude}&hl=fr&z=14&output=embed`"
              width="100%"
              height="300"
              style="border: 0"
              allowfullscreen="false"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div class="flex justify-center items-center">
            <IconDe class="text-custom-green" />
          </div>
        </div>

        <div class="pb-16">
          <h2 class="text-md font-bold mb-6">Événements similaires</h2>

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
            <p class="text-gray-600">
              Aucune activité similaire pour le moment.
            </p>
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
      <div v-else class="pb-8">
        <h2 class="text-2xl font-black text-custom-primary mb-12">
          Vous êtes inscrit à cet événement
        </h2>
        <button
          v-if="canCancelParticipation"
          @click="handleCancelParticipation"
          class="mb-10 px-6 py-3 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600 font-bold"
        >
          Annuler ma participation
        </button>
        <div class="grid grid-cols-2 gap-24 mb-16">
          <div class="red-border">
            <img
              :src="`/img/home/img-${activityStore.currentActivity.hostType}.png`"
              :alt="activityStore.currentActivity.title"
              class="w-full h-full object-cover rounded-lg z-10 relative"
            />
          </div>
          <div class="flex flex-col gap-6 h-full">
            <div class="bg-custom-red p-8 rounded-xl">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <div
                    v-for="(digit, index) in daysRemaining"
                    :key="index"
                    class="bg-custom-white text-custom-red text-4xl font-black w-16 h-16 flex items-center justify-center rounded-lg"
                  >
                    {{ digit }}
                  </div>
                  <p class="text-2xl font-black text-custom-white ml-4">
                    jours avant l'événement
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-custom-green rounded-2xl p-8">
              <h2 class="text-2xl text-custom-primary mb-4">Localisation</h2>
              <iframe
                :src="`https://www.google.com/maps?q=${activityStore.currentActivity.latitude},${activityStore.currentActivity.longitude}&hl=fr&z=14&output=embed`"
                width="100%"
                height="300"
                style="border: 0"
                allowfullscreen="false"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <div class="bg-custom-blue p-8 rounded-xl mb-6">
          <div class="grid grid-cols-2 gap-24">
            <div class="div">
              <h2 class="text-2xl text-custom-white font-black">
                {{ activityStore.currentActivity.title }}
              </h2>
              <p class="text-xl text-custom-white mt-4">
                {{ activityStore.currentActivity.description }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-24">
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconAgenda class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Date</p>
                    {{ formatDate(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconParticipant class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Participants</p>
                    {{ activityStore.currentActivity.playersId.length }} /
                    {{ activityStore.currentActivity.seats }}
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconNav class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Lieux</p>
                    <div v-if="activityStore.currentActivity.private">
                      Chez {{ getHost }},
                      <br />
                      {{ activityStore.currentActivity.city }}
                    </div>
                    <div v-else>
                      {{ formatShortAddress(activityStore.currentActivity) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconTime class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Heure</p>
                    {{ formatTime(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconDollar class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Prix</p>
                    {{ formatPriceValue(activityStore.currentActivity.price) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconPerson class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Organisateur</p>
                    {{ getHost }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <ChatPanel
      v-if="canAccessChat && activityStore.currentActivity"
      :activityId="activityStore.currentActivity.id"
      :user="authStore.user!"
      :token="authStore.tokens?.accessToken || null"
      :participants-ids="activityStore.currentActivity.playersId"
      class="mt-8"
    />

    <div v-else class="text-center py-8">
      <p class="text-gray-600">Activité non trouvée</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivityStore } from "../stores/activityStore";
import IconChevronLeft from "../components/atoms/icons/IconChevronLeft.vue";
import ProgressBar from "../components/atoms/ProgressBar.vue";
import IconAgenda from "../components/atoms/icons/IconAgenda.vue";
import IconParticipant from "@/components/atoms/icons/IconParticipant.vue";
import IconNav from "@/components/atoms/icons/IconNav.vue";
import IconTime from "@/components/atoms/icons/IconTime.vue";
import IconDollar from "@/components/atoms/icons/IconDollar.vue";
import IconPerson from "@/components/atoms/icons/IconPerson.vue";
import IconDe from "@/components/atoms/icons/IconDe.vue";
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

const route = useRoute();
const router = useRouter();
const activityStore = useActivityStore();
const authStore = useAuth();
const requestStatus = ref<ParticipationRequestStatus | "none">("none");
const requests = ref<ParticipationRequest[]>([]);
const requestsLoading = ref(false);
const paymentLoading = ref(false);
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

const formatPriceValue = (price?: string | number | null) => {
  const num = price !== null && price !== undefined ? Number(price) : 0;
  if (!num) return "Gratuit";
  return `${num.toFixed(2)} €`;
};

const formatShortAddress = (activity: {
  place_name?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
}) => {
  const place = activity.place_name?.trim();
  if (place) return place;
  const address = activity.address?.trim();
  const city = activity.city?.trim();
  const postalCode = activity.postalCode?.trim();
  const parts = [address, postalCode, city].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return "Adresse indisponible";
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
  return "Je participe a cet evenement";
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
