<template>
  <div class="container mx-auto pt-8">
    <div class="maps px-5 md:px-15">
      <iframe
        :src="`https://www.google.com/maps?q=${props.activity?.latitude},${props.activity?.longitude}&hl=fr&z=14&output=embed`"
        width="100%"
        height="300"
        style="border: 0"
        allowfullscreen="false"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="rounded-2xl"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Activity } from "@/types/Activity";

const props = defineProps<{
  activity: Activity | null;
}>();
</script>

<style scoped></style>
