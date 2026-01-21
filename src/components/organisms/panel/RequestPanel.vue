<template>
  <div class="bg-custom-blue p-8 rounded-xl mb-10">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl text-custom-white font-black">
        Demandes de participation
      </h2>
      <button
        class="px-4 py-2 hover:cursor-pointer bg-custom-white text-custom-primary rounded-lg hover:bg-custom-green font-bold"
        @click="emit('refreshRequests')"
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
            class="px-4 py-2 hover:cursor-pointer bg-custom-blue text-white rounded-lg hover:bg-custom-blue-hover font-bold"
            @click="emit('approveRequest', request.id)"
          >
            Accepter
          </button>
          <button
            class="px-4 py-2 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600 font-bold"
            @click="emit('rejectRequest', request.id)"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRequestStatus, formatPaymentStatus } from "@/utils/formatters";
import type { ParticipationRequest } from "@/types/ParticipationRequest";

defineProps<{
  requests: ParticipationRequest[];
  requestsLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "approveRequest", requestId: number): void;
  (e: "rejectRequest", requestId: number): void;
  (e: "refreshRequests"): void;
}>();
</script>

<style scoped></style>
