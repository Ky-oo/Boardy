<template>
  <div class="min-h-screen bg-custom-white mx-20 pt-32 pb-16">
    <div class="text-center mb-10">
      <h1 class="text-5xl font-family-urban text-primary my-6">
        Mon organisation
      </h1>
      <p class="text-primary text-lg font-family-red-hat">
        Consultez et creez des activites au nom de votre organisation.
      </p>
    </div>

    <div class="max-w-5xl mx-auto">
      <div v-if="loading" class="text-center text-gray-500 py-6">
        Chargement...
      </div>
      <div v-else-if="organisations.length === 0" class="text-center">
        <p class="text-gray-600">
          Vous n'avez aucune organisation pour le moment.
        </p>
        <p class="text-gray-500 text-sm mt-2">
          Contactez un administrateur pour en creer une.
        </p>
      </div>
      <div v-else>
        <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div class="flex-1">
            <label
              for="organisation"
              class="text-primary font-medium mb-2 block"
              >Organisation</label
            >
            <select
              id="organisation"
              v-model.number="selectedOrganisationId"
              class="w-full h-10 px-4 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 focus:outline-none focus:border-custom-white"
            >
              <option
                v-for="organisation in organisations"
                :key="organisation.id"
                :value="organisation.id"
              >
                {{ organisation.name }}
              </option>
            </select>
          </div>

          <button
            type="button"
            class="h-10 px-6 hover:cursor-pointer bg-custom-blue hover:bg-blue-600 text-custom-white font-semibold rounded-xl transition-colors"
            :disabled="!selectedOrganisationId"
            @click="goToCreateEvent"
          >
            Creer un evenement
          </button>
        </div>

        <div v-if="activitiesLoading" class="text-center text-gray-500 py-6">
          Chargement des activites...
        </div>
        <div v-else-if="activities.length === 0" class="text-center py-6">
          <p class="text-gray-600">
            Aucune activite creee pour cette organisation.
          </p>
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <ActivityCard
            v-for="activity in activities"
            :key="activity.id"
            :activity="activity"
          />
        </div>
      </div>

      <div v-if="errorMessage" class="text-red-500 text-sm text-center mt-6">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { get } from "@/utils/api/api";
import type { Activity, ActivityWithHost } from "@/types/Activity";
import { useActivityStore } from "@/stores/activityStore";
import { useOrganisationStore } from "@/stores/organisationStore";
import ActivityCard from "@/components/molecules/ActivityCard.vue";

const router = useRouter();
const activityStore = useActivityStore();
const organisationStore = useOrganisationStore();
const { organisations, loading, error } = storeToRefs(organisationStore);

const selectedOrganisationId = ref<number | null>(null);
const activities = ref<ActivityWithHost[]>([]);
const activitiesLoading = ref(false);
const activitiesError = ref("");

const errorMessage = computed(() => activitiesError.value || error.value || "");

const loadOrganisations = async () => {
  try {
    const list = await organisationStore.fetchMine();
    selectedOrganisationId.value = list[0]?.id ?? null;
  } catch (err: any) {
  } finally {
    activitiesError.value = "";
  }
};

const loadActivities = async (organisationId: number) => {
  activitiesLoading.value = true;
  activitiesError.value = "";
  try {
    const response = await get("/activity", {
      hostOrganisationId: organisationId,
      page: 1,
    });
    const rows: Activity[] = Array.isArray(response)
      ? response
      : response?.data || response?.rows || [];
    activities.value = rows.map((activity) =>
      activityStore.normalizeActivity(activity)
    );
  } catch (err: any) {
    activitiesError.value =
      err?.message || "Erreur lors du chargement des activites.";
  } finally {
    activitiesLoading.value = false;
  }
};

const goToCreateEvent = () => {
  if (!selectedOrganisationId.value) return;
  router.push({
    path: "/create_event",
    query: { organisationId: selectedOrganisationId.value.toString() },
  });
};

watch(selectedOrganisationId, (value) => {
  if (!value) {
    activities.value = [];
    return;
  }
  loadActivities(value);
});

onMounted(loadOrganisations);
</script>
