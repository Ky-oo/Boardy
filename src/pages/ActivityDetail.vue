<template>
  <div class="pt-20">
    <div v-if="activityStore.loading" class="text-center py-8">
      <p class="text-gray-600">Chargement de l'activité...</p>
    </div>

    <div v-else-if="activityStore.error" class="text-center py-8">
      <p class="text-red-600">{{ activityStore.error }}</p>
    </div>

    <div v-else-if="activityStore.currentActivity" class="lg:mx-30 py-6">
      <ReturnBackButton />

      <ActivityEditButtons
        v-if="canEdit"
        @handleDelete="handleDelete"
        @handleEdit="handleEdit"
        @openGuestModal="openGuestModal"
      />

      <AddGuestModal
        v-if="showGuestModal"
        :guest-loading="guestLoading"
        @closeGuestModal="closeGuestModal"
        @add-guest="
          (retreivedGuestName: string, retreivedGuestEmail: string) => {
            handleAddGuest(retreivedGuestName, retreivedGuestEmail);
          }
        "
      />

      <RequestPanel
        v-if="showRequestPanel"
        :requests="requests"
        :requests-loading="requestsLoading"
        @approveRequest="(requestId: number) => approveRequest(requestId)"
        @rejectRequest="(requestId: number) => rejectRequest(requestId)"
      />

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

      <ActivityInfoBar
        :activity="activityStore.currentActivity"
        :is-creator="canEdit"
        :is-participating="isParticipating"
        :participants-count="activityStore.currentActivity.playersId.length"
        :request-status="requestStatus"
        :host="getHost"
        @loadRequestStatus="loadRequestStatus"
        @requestParticipation="requestParticipation"
        class="mt-6 mb-10"
      />

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
  },
);
</script>
