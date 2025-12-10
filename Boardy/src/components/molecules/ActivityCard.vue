<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-xl font-bold mb-2">{{ activity.title }}</h3>
    <p class="text-gray-600 mb-4">{{ activity.description }}</p>
    <p class="text-sm">📅 {{ dateFormatted }}</p>
    <p class="text-sm">📍 {{ activity.address }}</p>
    <p class="text-sm">
      👥 {{ activity.playersId.length }} / {{ activity.seats }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Activity } from "@/types/Activity/index";

// Récupérer l'activité passée en props
const props = defineProps<{
  activity: Activity;
}>();

const dateFormatted = new Date(props.activity.date).toLocaleDateString(
  "fr-FR",
  {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
);
</script>
