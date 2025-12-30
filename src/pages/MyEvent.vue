<template>
  <div class="pt-40 mx-5 lg:mx-30 py-8">
    <h1
      class="text-4xl text-center font-family-urban font-black text-custom-primary mb-8"
    >
      Mes événements
    </h1>

    <!-- Événements à venir -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-custom-primary mb-6">
        À venir ({{ upcomingActivities.length }})
      </h2>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="upcomingActivities.length === 0" class="text-center py-8">
        <p class="text-gray-600">Aucun événement à venir.</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ActivityCard
            v-for="activity in upcomingDisplayed"
            :key="activity.id"
            :activity="activity"
          />
        </div>
        <div class="flex justify-center mt-8">
          <button
            v-if="canLoadMoreUpcoming"
            @click="loadMoreUpcoming"
            :disabled="activityStore.loading"
            class="px-6 py-3 hover:cursor-pointer bg-custom-blue text-custom-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ activityStore.loading ? "Chargement..." : "Charger plus" }}
          </button>
        </div>
      </div>
    </section>

    <!-- Événements créés -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-custom-primary mb-6">
        Événements que j'ai créés ({{ createdActivities.length }})
      </h2>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="createdActivities.length === 0" class="text-center py-8">
        <p class="text-gray-600">Vous n'avez créé aucun événement.</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ActivityCard
            v-for="activity in createdDisplayed"
            :key="activity.id"
            :activity="activity"
          />
        </div>
        <div class="flex justify-center mt-8">
          <button
            v-if="canLoadMoreCreated"
            @click="loadMoreCreated"
            :disabled="activityStore.loading"
            class="px-6 py-3 hover:cursor-pointer bg-custom-blue text-custom-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ activityStore.loading ? "Chargement..." : "Charger plus" }}
          </button>
        </div>
      </div>
    </section>

    <!-- Événements rejoints -->
    <section>
      <h2 class="text-2xl font-bold text-custom-primary mb-6">
        Événements auxquels je participe ({{ joinedActivities.length }})
      </h2>

      <div v-if="activityStore.loading" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div v-else-if="joinedActivities.length === 0" class="text-center py-8">
        <p class="text-gray-600">Vous ne participez à aucun événement.</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ActivityCard
            v-for="activity in joinedDisplayed"
            :key="activity.id"
            :activity="activity"
          />
        </div>
        <div class="flex justify-center mt-8">
          <button
            v-if="canLoadMoreJoined"
            @click="loadMoreJoined"
            :disabled="activityStore.loading"
            class="px-6 py-3 hover:cursor-pointer bg-custom-blue text-custom-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ activityStore.loading ? "Chargement..." : "Charger plus" }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useActivityStore } from "../stores/activityStore";
import ActivityCard from "@/components/molecules/ActivityCard.vue";
import { useAuth } from "@/stores/authStore";

const activityStore = useActivityStore();
const authStore = useAuth();

const visibleUpcoming = ref(3);
const visibleCreated = ref(3);
const visibleJoined = ref(3);

const createdActivities = computed(() => {
  if (!authStore.user) return [];
  return activityStore.getMyCreatedActivities(authStore.user.id);
});

const joinedActivities = computed(() => {
  if (!authStore.user) return [];
  return activityStore.getMyJoinedActivities(authStore.user.id);
});

const upcomingActivities = computed(() => {
  if (!authStore.user) return [];
  const now = new Date();
  return activityStore
    .getMyJoinedActivities(authStore.user.id)
    .filter((activity) => new Date(activity.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const upcomingDisplayed = computed(() =>
  upcomingActivities.value.slice(0, visibleUpcoming.value)
);
const createdDisplayed = computed(() =>
  createdActivities.value.slice(0, visibleCreated.value)
);
const joinedDisplayed = computed(() =>
  joinedActivities.value.slice(0, visibleJoined.value)
);

const canLoadMoreUpcoming = computed(
  () =>
    visibleUpcoming.value < upcomingActivities.value.length ||
    activityStore.hasMore
);
const canLoadMoreCreated = computed(
  () =>
    visibleCreated.value < createdActivities.value.length ||
    activityStore.hasMore
);
const canLoadMoreJoined = computed(
  () =>
    visibleJoined.value < joinedActivities.value.length || activityStore.hasMore
);

onMounted(() => {
  if (activityStore.activities.length === 0) {
    activityStore.fetchActivities();
  }
});

const loadMoreUpcoming = async () => {
  if (visibleUpcoming.value < upcomingActivities.value.length) {
    visibleUpcoming.value += 3;
    return;
  }
  if (activityStore.loading || !activityStore.hasMore) return;
  await activityStore.fetchActivities(activityStore.currentPage + 1, true);
  visibleUpcoming.value = Math.min(
    visibleUpcoming.value + 3,
    upcomingActivities.value.length
  );
};

const loadMoreCreated = async () => {
  if (visibleCreated.value < createdActivities.value.length) {
    visibleCreated.value += 3;
    return;
  }
  if (activityStore.loading || !activityStore.hasMore) return;
  await activityStore.fetchActivities(activityStore.currentPage + 1, true);
  visibleCreated.value = Math.min(
    visibleCreated.value + 3,
    createdActivities.value.length
  );
};

const loadMoreJoined = async () => {
  if (visibleJoined.value < joinedActivities.value.length) {
    visibleJoined.value += 3;
    return;
  }
  if (activityStore.loading || !activityStore.hasMore) return;
  await activityStore.fetchActivities(activityStore.currentPage + 1, true);
  visibleJoined.value = Math.min(
    visibleJoined.value + 3,
    joinedActivities.value.length
  );
};

</script>
