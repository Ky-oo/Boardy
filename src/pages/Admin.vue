<template>
  <div class="min-h-screen bg-custom-bg mx-20 pt-32 pb-16">
    <div class="text-center mb-10">
      <h1 class="text-5xl font-family-urban text-primary my-6">Espace admin</h1>
      <p class="text-primary text-lg font-family-red-hat">
        Créez et gérez les organisations.
      </p>
    </div>

    <div class="flex justify-center mb-10">
      <button
        type="button"
        class="h-10 px-6 hover:cursor-pointer bg-custom-blue hover:bg-blue-600 text-custom-white font-semibold rounded-xl transition-colors"
        @click="router.push({ path: '/create_event', query: { boardy: '1' } })"
      >
        Creer un évènement Boardy
      </button>
    </div>

    <AdminCreateOrganisationCard
      @organisation-created="
        (organisation: Organisation) =>
          (organisations = [organisation, ...organisations])
      "
    />

    <div class="max-w-4xl mx-auto mt-10">
      <h2 class="text-2xl font-bold text-primary mb-4">
        Organisations existantes
      </h2>
      <div v-if="loadingOrganisations" class="text-center text-gray-500 py-6">
        Chargement...
      </div>
      <div v-else-if="organisations.length === 0" class="text-gray-500">
        Aucune organisation pour le moment.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminOrganisationGridItem
          v-for="organisation in organisations"
          :key="organisation.id"
          :organisation="organisation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type { Organisation } from "@/types/Organisation";
import { get } from "@/utils/api/api";
import AdminCreateOrganisationCard from "@/components/organisms/card/AdminCreateOrganisationCard.vue";

const router = useRouter();
const organisations = ref<Organisation[]>([]);
const loadingOrganisations = ref(false);
const error = ref("");

const loadOrganisations = async () => {
  loadingOrganisations.value = true;

  try {
    organisations.value = await get("/organisation");
  } catch (err: any) {
    error.value =
      err?.message || "Erreur lors du chargement des organisations.";
  } finally {
    loadingOrganisations.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadOrganisations()]);
});
</script>
