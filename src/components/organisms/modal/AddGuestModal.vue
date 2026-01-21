<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="emit('closeGuestModal')"
  >
    <div class="bg-custom-white rounded-xl p-6 w-full max-w-md shadow-lg">
      <h3 class="text-xl font-bold text-primary mb-4">
        Ajouter un participant externe
      </h3>
      <form
        @submit.prevent="
          emit('addGuest', retreivedGuestName, retreivedGuestEmail)
        "
      >
        <div class="flex flex-col gap-2 mb-3">
          <label for="guest-name" class="text-primary font-medium"
            >Prénom*</label
          >
          <input
            id="guest-name"
            v-model.trim="retreivedGuestName"
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
            v-model.trim="retreivedGuestEmail"
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
            @click="emit('closeGuestModal')"
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
</template>

<script setup lang="ts">
import { ref } from "vue";
const emit = defineEmits(["closeGuestModal", "addGuest"]);

defineProps<{ guestLoading: boolean }>();

const guestError = ref("");
const retreivedGuestName = ref("");
const retreivedGuestEmail = ref("");
</script>

<style scoped></style>
