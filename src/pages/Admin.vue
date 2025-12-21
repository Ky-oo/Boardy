<template>
  <div class="min-h-screen bg-custom-white mx-20 pt-32 pb-16">
    <div class="text-center mb-10">
      <h1 class="text-5xl font-family-urban text-primary my-6">
        Espace admin
      </h1>
      <p class="text-primary text-lg font-family-red-hat">
        Creez et gerez les organisations.
      </p>
    </div>

    <div
      class="max-w-4xl mx-auto bg-custom-white border border-custom-blue/30 rounded-3xl shadow-lg p-8"
    >
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="name" class="text-primary font-medium"
              >Nom de l'organisation*</label
            >
            <input
              id="name"
              v-model.trim="form.name"
              type="text"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="address" class="text-primary font-medium"
              >Adresse*</label
            >
            <input
              id="address"
              v-model.trim="form.address"
              type="text"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="owner" class="text-primary font-medium"
              >Proprietaire (optionnel)</label
            >
            <select
              id="owner"
              v-model="form.ownerId"
              class="w-full h-10 px-4 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 focus:outline-none focus:border-custom-white"
            >
              <option value="">Moi (admin)</option>
              <option
                v-for="user in users"
                :key="user.id"
                :value="user.id.toString()"
              >
                {{ user.firstname }} {{ user.lastname }} ({{ user.email }})
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-4 pt-2">
          <button
            type="button"
            class="h-10 px-6 hover:cursor-pointer bg-custom-green hover:bg-custom-green-hover text-gray-800 font-semibold rounded-xl transition-colors"
            @click="resetForm"
          >
            Annuler
          </button>

          <button
            type="submit"
            class="h-10 px-6 hover:cursor-pointer bg-custom-blue hover:bg-blue-600 text-custom-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            {{ loading ? "Creation..." : "Creer l'organisation" }}
          </button>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>
      </form>
    </div>

    <div class="max-w-4xl mx-auto mt-10">
      <h2 class="text-2xl font-bold text-primary mb-4">
        Organisations existantes
      </h2>
      <div
        v-if="loadingOrganisations"
        class="text-center text-gray-500 py-6"
      >
        Chargement...
      </div>
      <div v-else-if="organisations.length === 0" class="text-gray-500">
        Aucune organisation pour le moment.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="organisation in organisations"
          :key="organisation.id"
          class="border border-custom-blue/20 rounded-xl p-4 bg-custom-white"
        >
          <p class="font-semibold text-primary">{{ organisation.name }}</p>
          <p class="text-sm text-gray-600">{{ organisation.address }}</p>
          <p class="text-xs text-gray-500">Owner ID: {{ organisation.ownerId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { get, post } from "@/utils/api/api";
import type { Organisation } from "@/types/Organisation";
import type { UserWithoutPassword } from "@/types/User";
import { useToastStore } from "@/stores/toastStore";

const users = ref<UserWithoutPassword[]>([]);
const organisations = ref<Organisation[]>([]);
const loading = ref(false);
const loadingOrganisations = ref(false);
const error = ref("");
const toastStore = useToastStore();

const form = reactive({
  name: "",
  address: "",
  ownerId: "",
});

const resetForm = () => {
  form.name = "";
  form.address = "";
  form.ownerId = "";
  error.value = "";
};

const loadUsers = async () => {
  try {
    const response = await get("/user");
    users.value = Array.isArray(response) ? response : response?.data || [];
  } catch (err: any) {
    error.value = err?.message || "Erreur lors du chargement des utilisateurs.";
  }
};

const loadOrganisations = async () => {
  loadingOrganisations.value = true;
  try {
    const response = await get("/organisation");
    organisations.value = Array.isArray(response)
      ? response
      : response?.data || [];
  } catch (err: any) {
    error.value = err?.message || "Erreur lors du chargement des organisations.";
  } finally {
    loadingOrganisations.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.name || !form.address) return;
  loading.value = true;
  error.value = "";
  try {
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      address: form.address.trim(),
    };
    if (form.ownerId) {
      payload.ownerId = Number(form.ownerId);
    }
    const organisation: Organisation = await post("/organisation", payload);
    organisations.value = [organisation, ...organisations.value];
    toastStore.addToast("Organisation creee.", { type: "success" });
    resetForm();
  } catch (err: any) {
    error.value = err?.message || "Erreur lors de la creation.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadUsers(), loadOrganisations()]);
});
</script>
