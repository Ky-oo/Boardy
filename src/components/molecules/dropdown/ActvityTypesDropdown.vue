<template>
  <div class="relative w-full md:w-auto h-10">
    <select
      id="type"
      name="type"
      v-model="selectedType"
      @change="emit('updateSelectedType', selectedType)"
      class="block w-full hover:cursor-pointer md:w-auto h-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 leading-none"
    >
      <option value="">Tous les types</option>
      <option v-for="t in eventTypes" :key="t" :value="t">
        <span class="hover:cursor-pointer">{{ t }}</span>
      </option>
    </select>

    <IconChevronDown />
  </div>
</template>

<script setup lang="ts">
import type { ActivityType, Activity } from "@/types/Activity";
import IconChevronDown from "@/components/atoms/icons/IconChevronDown.vue";
import { ref } from "vue";

const emit = defineEmits(["updateSelectedType"]);

const selectedType = ref<"" | Activity["type"]>("");

const eventTypes: ActivityType[] = [
  "Festival",
  "Bars & Soirées",
  "Par des joueurs",
];
</script>
