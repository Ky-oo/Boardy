<template>
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
          <label for="address" class="text-primary font-medium">Adresse*</label>
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
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useToastStore } from "@/stores/toastStore";
import { post, get } from "@/utils/api/api";
import type { Organisation } from "@/types/Organisation";
import type { UserWithoutPassword } from "@/types/User";

const toastStore = useToastStore();
const loading = ref(false);
const error = ref("");
const users = ref<UserWithoutPassword[]>([]);

const emit = defineEmits<{
  (e: "organisationCreated", organisation: Organisation): void;
}>();

const resetForm = () => {
  form.name = "";
  form.address = "";
  form.ownerId = "";
  error.value = "";
};

const form = reactive({
  name: "",
  address: "",
  ownerId: "",
});

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

    const organisation = await post("/organisation", payload);

    toastStore.addToast("Organisation créée.", { type: "success" });
    resetForm();
    emit("organisationCreated", organisation);
  } catch (err: any) {
    error.value = err?.message || "Erreur lors de la creation.";
  } finally {
    loading.value = false;
  }
};

const loadUsers = async () => {
  try {
    const response = await get("/user");
    users.value = Array.isArray(response) ? response : response?.data || [];
  } catch (err: any) {
    error.value = err?.message || "Erreur lors du chargement des utilisateurs.";
  }
};

onMounted(async () => {
  await Promise.all([loadUsers()]);
});
</script>

<style scoped></style>
