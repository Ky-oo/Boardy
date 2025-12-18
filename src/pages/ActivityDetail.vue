<template>
  <div class="pt-30">
    <div v-if="activityStore.loading" class="text-center py-8">
      <p class="text-gray-600">Chargement de l'activité...</p>
    </div>

    <div v-else-if="activityStore.error" class="text-center py-8">
      <p class="text-red-600">{{ activityStore.error }}</p>
    </div>

    <div v-else-if="activityStore.currentActivity" class="mx-30 py-6">
      <button
        @click="$router.back()"
        class="flex items-center text-custom-primary text-2xl py-3 hover:cursor-pointer mb-6"
      >
        <IconChevronLeft class="mr-2" /> Retour
      </button>

      <div v-if="!isParticipating">
        <div class="green-bloc grid grid-cols-2 gap-24 mb-16">
          <div class="red-border">
            <img
              :src="`/img/home/img-${activityStore.currentActivity.hostType}.png`"
              :alt="activityStore.currentActivity.title"
              class="w-full h-full object-cover rounded-lg z-10 relative"
            />
          </div>
          <div class="flex flex-col gap-6 h-full">
            <div class="bg-custom-red p-8 rounded-xl flex-1">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-black text-custom-white">
                  Places restantes
                </h2>
                <p class="text-custom-white text-2xl font-black">
                  {{
                    activityStore.currentActivity.seats -
                    activityStore.currentActivity.playersId.length
                  }}
                </p>
              </div>
              <ProgressBar
                :current="activityStore.currentActivity.playersId.length"
                :max="activityStore.currentActivity.seats"
                class="py-8"
              />
              <button
                v-if="!authStore.isLogged"
                @click="$router.push('/login')"
                class="bg-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-green font-bold w-full"
              >
                Connectez-vous pour participer
              </button>
              <button
                v-else-if="!isPending && authStore.isLogged"
                @click="handleParticipate"
                class="bg-custom-white hover:cursor-pointer text-custom-primary px-6 py-3 rounded-lg hover:bg-custom-green font-bold w-full"
              >
                Je participe à cet événement
              </button>

              <button
                v-else
                disabled
                class="bg-gray-400 text-custom-white px-6 py-3 rounded-lg cursor-not-allowed font-bold w-full"
              >
                En attente de l'hôte
              </button>
            </div>

            <div class="bg-custom-blue p-8 rounded-xl flex-1">
              <h2 class="text-2xl font-black text-custom-white mb-4">
                Bon à savoir
              </h2>

              <ul class="text-custom-white list-disc list-inside space-y-2">
                <li>Confirmation immédiate de votre participation</li>
                <li>Rappel envoyé 24h avant l’événement</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-custom-blue p-8 rounded-xl mb-6">
          <div class="grid grid-cols-2 gap-24">
            <div class="div">
              <h2 class="text-2xl text-custom-white font-black">
                {{ activityStore.currentActivity.title }}
              </h2>
              <p class="text-xl text-custom-white mt-4">
                {{ activityStore.currentActivity.description }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-24">
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconAgenda class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Date</p>
                    {{ formatDate(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconParticipant class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Participants</p>
                    {{ activityStore.currentActivity.playersId.length }} /
                    {{ activityStore.currentActivity.seats }}
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconNav class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Lieux</p>
                    <div v-if="activityStore.currentActivity.private">
                      Chez {{ getHost }},
                      <br />
                      {{ activityStore.currentActivity.city }}
                    </div>
                    <div v-else>
                      {{ activityStore.currentActivity.place_name }},
                      <br />
                      {{ activityStore.currentActivity.address }},
                      <br />
                      {{ activityStore.currentActivity.postalCode }}
                      {{ activityStore.currentActivity.city }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconTime class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Heure</p>
                    {{ formatTime(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconDollar class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Prix</p>
                    {{ formatPriceValue(activityStore.currentActivity.price) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconPerson class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Organisateur</p>
                    {{ getHost }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-24 mb-16">
          <div class="bg-custom-green rounded-2xl p-8">
            <h2 class="text-2xl text-custom-primary mb-4">Localisation</h2>
            <iframe
              :src="`https://www.google.com/maps?q=${activityStore.currentActivity.latitude},${activityStore.currentActivity.longitude}&hl=fr&z=14&output=embed`"
              width="100%"
              height="300"
              style="border: 0"
              allowfullscreen="false"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div class="flex justify-center items-center">
            <IconDe class="text-custom-green" />
          </div>
        </div>

        <div class="pb-16">
          <h2 class="text-md font-bold mb-6">Événements similaires</h2>

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
            <p class="text-gray-600">
              Aucune activité similaire pour le moment.
            </p>
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
      <div v-else class="pb-8">
        <h2 class="text-2xl font-black text-custom-primary mb-12">
          Vous êtes inscrit à cet événement
        </h2>
        <div class="grid grid-cols-2 gap-24 mb-16">
          <div class="red-border">
            <img
              :src="`/img/home/img-${activityStore.currentActivity.hostType}.png`"
              :alt="activityStore.currentActivity.title"
              class="w-full h-full object-cover rounded-lg z-10 relative"
            />
          </div>
          <div class="flex flex-col gap-6 h-full">
            <div class="bg-custom-red p-8 rounded-xl">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <div
                    v-for="(digit, index) in daysRemaining"
                    :key="index"
                    class="bg-custom-white text-custom-red text-4xl font-black w-16 h-16 flex items-center justify-center rounded-lg"
                  >
                    {{ digit }}
                  </div>
                  <p class="text-2xl font-black text-custom-white ml-4">
                    jours avant l'événement
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-custom-green rounded-2xl p-8">
              <h2 class="text-2xl text-custom-primary mb-4">Localisation</h2>
              <iframe
                :src="`https://www.google.com/maps?q=${activityStore.currentActivity.latitude},${activityStore.currentActivity.longitude}&hl=fr&z=14&output=embed`"
                width="100%"
                height="300"
                style="border: 0"
                allowfullscreen="false"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <div class="bg-custom-blue p-8 rounded-xl mb-6">
          <div class="grid grid-cols-2 gap-24">
            <div class="div">
              <h2 class="text-2xl text-custom-white font-black">
                {{ activityStore.currentActivity.title }}
              </h2>
              <p class="text-xl text-custom-white mt-4">
                {{ activityStore.currentActivity.description }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-24">
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconAgenda class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Date</p>
                    {{ formatDate(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconParticipant class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Participants</p>
                    {{ activityStore.currentActivity.playersId.length }} /
                    {{ activityStore.currentActivity.seats }}
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconNav class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Lieux</p>
                    <div v-if="activityStore.currentActivity.private">
                      Chez {{ getHost }},
                      <br />
                      {{ activityStore.currentActivity.city }}
                    </div>
                    <div v-else>
                      {{ activityStore.currentActivity.place_name }},
                      <br />
                      {{ activityStore.currentActivity.address }},
                      <br />
                      {{ activityStore.currentActivity.postalCode }}
                      {{ activityStore.currentActivity.city }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconTime class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Heure</p>
                    {{ formatTime(activityStore.currentActivity.date) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconDollar class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Prix</p>
                    {{ formatPriceValue(activityStore.currentActivity.price) }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="bg-custom-white p-4 rounded-lg me-3">
                    <IconPerson class="text-custom-red w-5 h-5" />
                  </div>
                  <div class="text-custom-white">
                    <p class="text-sm text-custom-green">Organisateur</p>
                    {{ getHost }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-custom-green rounded-xl p-8">
          <div class="flex justify-between items-center pb-8">
            <h2 class="text-2xl">Chat de l'événement</h2>
            <div class="flex">
              <a
                href="#"
                class="px-6 py-3 rounded-2xl bg-custom-blue text-custom-white"
                >Messages</a
              >
              <a href="#" class="px-6 py-3 rounded-2xl text-custom-blue"
                >Participants</a
              >
            </div>
          </div>
          <div class="bg-custom-white p-8 rounded-2xl">
            <img src="/img/activityPage/chat.png" alt="Chat" class="w-full" />
            <div class="relative mt-4">
              <input
                type="text"
                placeholder="Écrire un message..."
                class="w-full p-4 pr-14 bg-custom-green rounded-2xl outline-none focus:ring-2 focus:ring-custom-primary"
              />
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 bg-custom-blue p-2 rounded-lg hover:cursor-pointer"
                @click="sendMessage"
              >
                <IconSend class="text-custom-white w-5 h-5" />
              </button>
            </div>
          </div>
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
import IconChevronLeft from "../components/atoms/icons/IconChevronLeft.vue";
import ProgressBar from "../components/atoms/ProgressBar.vue";
import IconAgenda from "../components/atoms/icons/IconAgenda.vue";
import IconParticipant from "@/components/atoms/icons/IconParticipant.vue";
import IconNav from "@/components/atoms/icons/IconNav.vue";
import IconTime from "@/components/atoms/icons/IconTime.vue";
import IconDollar from "@/components/atoms/icons/IconDollar.vue";
import IconPerson from "@/components/atoms/icons/IconPerson.vue";
import IconDe from "@/components/atoms/icons/IconDe.vue";
import IconSend from "@/components/atoms/icons/IconSend.vue";
import ActivityCard from "@/components/molecules/ActivityCard.vue";
import { useAuth } from "@/stores/authStore";

const route = useRoute();
const router = useRouter();
const activityStore = useActivityStore();
const authStore = useAuth();
const isPending = ref(false);

const isParticipating = computed(() => {
  if (!activityStore.currentActivity || !authStore.user) return false;
  return activityStore.currentActivity.playersId.includes(authStore.user.id);
});

const daysRemaining = computed(() => {
  if (!activityStore.currentActivity) return ["0", "0"];
  const now = new Date();
  const eventDate = new Date(activityStore.currentActivity.date);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const days = Math.max(0, diffDays);
  return days.toString().padStart(2, "0").split("");
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "numeric",
    minute: "numeric",
  });
};

const formatPriceValue = (price?: string | number | null) => {
  const num = price !== null && price !== undefined ? Number(price) : 0;
  if (!num) return "Gratuit";
  return `${num.toFixed(2)} €`;
};

const handleParticipate = async () => {
  if (!activityStore.currentActivity) return;
  try {
    const updated = await activityStore.joinActivity(
      activityStore.currentActivity.id
    );
    if (updated.private) {
      isPending.value = true;
    } else {
      setTimeout(() => {
        router.push("/participation-confirmed");
      }, 500);
    }
  } catch (err) {
    console.error("Erreur lors de la participation:", err);
  }
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
    return `Meeples`;
  }
  return "";
});

const sendMessage = () => {
  // TODO: Implémenter l'envoi de message
  console.log("Message envoyé");
};

onMounted(async () => {
  const id = Number(route.params.id);
  if (id) {
    // Charger toutes les activités si elles ne sont pas déjà chargées
    if (activityStore.activities.length === 0) {
      await activityStore.fetchActivities();
    }
    activityStore.fetchActivity(id);
  }
});

// Écouter les changements d'ID dans l'URL pour recharger l'activité
watch(
  () => route.params.id,
  async (newId) => {
    const id = Number(newId);
    if (id) {
      isPending.value = false; // Réinitialiser l'état
      // Charger toutes les activités si elles ne sont pas déjà chargées
      if (activityStore.activities.length === 0) {
        await activityStore.fetchActivities();
      }
      activityStore.fetchActivity(id);
      window.scrollTo(0, 0); // Remonter en haut de la page
    }
  }
);
</script>
