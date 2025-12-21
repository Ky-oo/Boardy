<template>
  <div class="min-h-screen bg-custom-white mx-20 pt-32 pb-16">
    <div class="text-center mb-10">
      <h1 class="text-5xl font-family-urban text-primary my-6">Mon profil</h1>
      <p class="text-primary text-lg font-family-red-hat">
        Mettez à jour vos informations personnelles.
      </p>
    </div>

    <div
      class="max-w-3xl mx-auto bg-custom-white border border-custom-blue/30 rounded-3xl shadow-lg p-8"
    >
      <div v-if="!authStore.user" class="text-center text-gray-500">
        Chargement du profil...
      </div>

      <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="firstname" class="text-primary font-medium"
              >Prénom*</label
            >
            <input
              id="firstname"
              v-model.trim="form.firstname"
              type="text"
              autocomplete="given-name"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="lastname" class="text-primary font-medium">Nom*</label>
            <input
              id="lastname"
              v-model.trim="form.lastname"
              type="text"
              autocomplete="family-name"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="pseudo" class="text-primary font-medium">Pseudo*</label>
            <input
              id="pseudo"
              v-model.trim="form.pseudo"
              type="text"
              autocomplete="nickname"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="email" class="text-primary font-medium">Email*</label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="city" class="text-primary font-medium">Ville*</label>
            <input
              id="city"
              v-model.trim="form.city"
              type="text"
              autocomplete="address-level2"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-custom-white"
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-center gap-4 pt-2">
          <div class="flex flex-1 justify-end gap-4">
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
              :disabled="loading || !isDirty"
            >
              {{ loading ? "Enregistrement..." : "Enregistrer" }}
            </button>
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { UserWithoutPassword } from "@/types/User";
import { useAuth } from "@/stores/authStore";

const authStore = useAuth();
const loading = ref(false);
const error = ref("");

const form = reactive({
  firstname: "",
  lastname: "",
  pseudo: "",
  email: "",
  city: "",
});

const fillForm = (user: UserWithoutPassword | null) => {
  if (!user) return;
  form.firstname = user.firstname ?? "";
  form.lastname = user.lastname ?? "";
  form.pseudo = user.pseudo ?? "";
  form.email = user.email ?? "";
  form.city = user.city ?? "";
};

watch(
  () => authStore.user,
  (user) => {
    fillForm(user);
  },
  { immediate: true }
);

const isDirty = computed(() => {
  const user = authStore.user;
  if (!user) return false;
  return (
    form.firstname !== (user.firstname ?? "") ||
    form.lastname !== (user.lastname ?? "") ||
    form.pseudo !== (user.pseudo ?? "") ||
    form.email !== (user.email ?? "") ||
    form.city !== (user.city ?? "")
  );
});

const resetForm = () => {
  fillForm(authStore.user);
  error.value = "";
};

const handleSubmit = async () => {
  if (!authStore.user) {
    error.value = "Utilisateur non charge.";
    return;
  }
  if (!isDirty.value) return;

  loading.value = true;
  error.value = "";
  try {
    await (authStore as any).updateProfile({
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      pseudo: form.pseudo.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
    });
  } catch (e: any) {
    error.value = e.message || "Erreur lors de la mise a jour du profil.";
  } finally {
    loading.value = false;
  }
};
</script>
