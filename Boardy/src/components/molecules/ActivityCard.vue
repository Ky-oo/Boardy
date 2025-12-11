<template>
  <div
    class="bg-custom-blue rounded-lg shadow-md p-6 text-custom-white flex justify-between h-full flex-col"
  >
    <div class="relative">
      <div
        :class="[
          'flag',
          'absolute',
          'top-2',
          'left-2',
          'p-2',
          getTypeColor,
          'rounded-3xl',
        ]"
      >
        {{ activity.type }}
      </div>
      <img
        :src="getImagePath"
        :alt="activity.title"
        class="w-full object-cover rounded-md mb-4"
      />
      <div>
        <h3 class="text-xl font-bold mb-2">{{ activity.title }}</h3>
        <p class="text-sm font-regular mb-4">{{ activity.description }}</p>
        <div class="px-3">
          <div class="flex items-center mb-0.5">
            <IconAgenda class="text-custom-white me-1" />
            <p class="text-sm font-bold">{{ dateFormatted }}</p>
          </div>
          <div class="flex items-center mb-0.5">
            <IconTime class="text-custom-white me-1" />
            <p class="text-sm font-bold">{{ timeFormatted }}</p>
          </div>
          <div class="flex items-center mb-0.5">
            <IconNav class="text-custom-white me-1" />
            <p class="text-sm font-bold">{{ getAddress }}</p>
          </div>
          <div class="flex items-center mb-0.5">
            <IconParticipant class="text-custom-white me-1" />
            <p class="text-sm font-bold">
              {{ activity.playersId.length }} / {{ activity.seats }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="flex justify-between items-center mt-4">
        <div>
          <p>{{ getPrice }}</p>
        </div>
        <div class="flex items-center">
          <p>{{ getHost }}</p>
          <IconMeeple class="text-custom-white ms-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ActivityWithHost } from "@/types/Activity/index";
import IconAgenda from "@/components/atoms/icons/IconAgenda.vue";
import IconTime from "@/components/atoms/icons/IconTime.vue";
import IconNav from "../atoms/icons/IconNav.vue";
import IconParticipant from "../atoms/icons/IconParticipant.vue";
import IconMeeple from "../atoms/icons/IconMeeple.vue";

// Récupérer l'activité passée en props
const props = defineProps<{
  activity: ActivityWithHost;
}>();

const dateFormatted = new Date(props.activity.date).toLocaleDateString(
  "fr-FR",
  {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
);

const timeFormatted = new Date(props.activity.date).toLocaleTimeString(
  "fr-FR",
  {
    hour: "numeric",
    minute: "numeric",
  }
);

// Fonction pour obtenir le bon chemin d'image selon le hostType
const getImagePath = computed(() => {
  return `/img/home/img-${props.activity.hostType}.png`;
});

const getAddress = computed(() => {
  if (props.activity.homeHost === true && props.activity.host) {
    return `${props.activity.city}, Chez ${props.activity.host.firstname} ${props.activity.host.lastname}`;
  } else {
    return `${props.activity.city}, ${
      props.activity.place_name || props.activity.address
    }`;
  }
});

const getPrice = computed(() => {
  if (
    props.activity.price === 0 ||
    props.activity.price === null ||
    props.activity.price === undefined
  ) {
    return "Gratuit";
  } else if (props.activity.price) {
    return `${props.activity.price}€`;
  }
});

const getHost = computed(() => {
  if (props.activity.homeHost === true && props.activity.host) {
    return `Par ${props.activity.host.firstname}`;
  } else if (
    props.activity.hostType === "user" &&
    props.activity.homeHost === false &&
    props.activity.host
  ) {
    return `Par ${props.activity.host.firstname}`;
  } else if (
    props.activity.hostType === "organisation" &&
    props.activity.organisation
  ) {
    return `Par ${props.activity.organisation.name}`;
  } else if (props.activity.hostType === "event" && props.activity.host) {
    return `Par Meeples`;
  }
});

const getTypeColor = computed(() => {
  if (props.activity.type === "Festival") {
    return "bg-custom-white text-primary";
  } else if (props.activity.type === "Par des joueurs") {
    return "bg-custom-green text-primary";
  } else if (props.activity.type === "Bar/Soirée") {
    return "bg-custom-red";
  }
});
</script>
