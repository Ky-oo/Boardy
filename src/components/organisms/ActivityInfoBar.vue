<template>
  <div class="container mx-auto">
    <div
      class="filter-bar mx-5 md:mx-15 mb-35 px-10 py-8 bg-custom-green rounded-xl"
    >
      <h1 class="text-2xl text-primary font-black pb-4">
        {{ props.activity?.title }}
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
                {{ formatDate(props.activity?.date) }} à
                {{ formatTime(props.activity?.date) }}
              </div>
            </div>
          </div>
          <div class="flex items-start pb-4">
            <div class="bg-custom-white p-2 rounded-lg me-3">
              <IconNav class="text-custom-blue w-5 h-5" />
            </div>
            <div class="text-primary">
              <p class="text-sm text-primary">Lieux</p>
              <div v-if="props.activity?.private">
                Chez {{ props.host }},
                <br />
                {{ props.activity?.city }}
              </div>
              <div v-else>
                <div class="flex flex-col gap-2">
                  <a
                    v-if="
                      activityStore?.currentActivity &&
                      getAddressHref(props.activity)
                    "
                    :href="getAddressHref(props.activity)!"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline text-custom-blue hover:no-underline mb-0"
                  >
                    {{ formatShortAddress(props.activity) }}
                  </a>
                  <span v-else-if="activityStore?.currentActivity" class="mb-2">
                    {{ formatShortAddress(props.activity) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isParticipating">
            <div class="flex items-center">
              <div class="bg-custom-white p-2 rounded-lg me-3">
                <IconParticipant class="text-custom-blue w-5 h-5" />
              </div>
              <div class="text-primary">
                <p class="text-sm text-primary">Participants</p>
                {{ participantsCount }} /
                {{ props.activity?.seats }}
              </div>
            </div>
          </div>
        </div>
        <div class="w-full lg:w-1/3">
          <div v-if="!isParticipating">
            <div class="flex justify-between items-center">
              <h2 class="text-xl text-primary">Participants</h2>
              <p class="text-primary text-2xl font-black">
                {{ (props.activity?.seats ?? 0) - remainingSeats }}
                /
                {{ props.activity?.seats }}
              </p>
            </div>
            <ProgressBar
              :current="participantsCount"
              :max="props.activity?.seats"
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
              :disabled="paymentStore.checkoutLoading"
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressBar from "@/components/atoms/ProgressBar.vue";
import IconAgenda from "@/components/atoms/icons/IconAgenda.vue";
import IconParticipant from "@/components/atoms/icons/IconParticipant.vue";
import IconNav from "@/components/atoms/icons/IconNav.vue";

import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";
import { usePaymentStore } from "@/stores/paymentStore";
import { useRouter } from "vue-router";
import { formatDate, formatTime } from "@/utils/dateUtils";
import {
  formatShortAddress,
  getAddressHref,
} from "@/utils/activityAddressUtils";
import type { Activity } from "@/types/Activity";

const activityStore = useActivityStore();
const authStore = useAuthStore();
const router = useRouter();
const paymentStore = usePaymentStore();

const isPaidActivity = computed(() => priceNumber.value > 0);
const isRequestPending = computed(() => props.requestStatus === "pending");
const props = defineProps<{
  activity: Activity;
  isCreator: boolean;
  isParticipating: boolean;
  participantsCount: number;
  requestStatus: string;
  host: string;
}>();

const emit = defineEmits<{
  (e: "loadRequestStatus"): void;
  (e: "requestParticipation"): void;
}>();

const remainingSeats = computed(() => {
  if (!props.activity) return 0;
  const seats = Number(props.activity.seats || 0);
  return Math.max(0, seats - participantsCount.value);
});

const canRequestParticipation = computed(() => {
  if (!props.activity || !authStore.isLogged) return false;
  if (props.isCreator) return false;
  if (props.isParticipating) return false;
  if (props.requestStatus === "pending") return false;
  if (props.requestStatus === "approved") return false;
  return true;
});

const daysRemaining = computed(() => {
  if (!props.activity) return ["0", "0"];
  const now = new Date();
  const eventDate = new Date(props.activity.date);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const days = Math.max(0, diffDays);
  return days.toString().padStart(2, "0").split("");
});

const participantsCount = computed(() => {
  if (!props.activity) return 0;
  return props.activity.playersId.length + guestCount.value;
});

const guestCount = computed(() => props.activity?.guestUsers?.length ?? 0);

const startPayment = async () => {
  if (!props.activity) return;
  const result = await paymentStore.startCheckout(props.activity.id);
  if (
    !result.ok &&
    (result.message === "Payment already started" ||
      result.message === "Request already pending")
  ) {
    emit("loadRequestStatus");
  }
};

const priceNumber = computed(() => {
  if (!props.activity) return 0;
  const raw = props.activity.price ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
});

const participateLabel = computed(() => {
  if (paymentStore.checkoutLoading) {
    return "Redirection vers le paiement...";
  }
  if (props.activity?.private) {
    if (props.requestStatus === "rejected") {
      return "Redemander a rejoindre";
    }
    if (isPaidActivity.value) {
      return `Demander a rejoindre (pre-autorisation ${priceNumber.value.toFixed(
        2,
      )} euro)`;
    }
    return "Demander a rejoindre";
  }
  if (isPaidActivity.value) {
    return `Participer pour ${priceNumber.value.toFixed(2)} euro`;
  }
  return "Je participe à l'événement";
});

const handleParticipate = async () => {
  if (!props.activity) return;
  if (props.activity.private) {
    if (isPaidActivity.value) {
      await startPayment();
    } else {
      await emit("requestParticipation");
    }
    return;
  }
  if (isPaidActivity.value) {
    await startPayment();
    return;
  }
  try {
    const updated = await activityStore.joinActivity(props.activity.id);
    if (!updated.private) {
      setTimeout(() => {
        router.push("/participation-confirmed");
      }, 500);
    }
  } catch (err) {
    console.error("Erreur lors de la participation:", err);
  }
};
</script>

<style scoped></style>
