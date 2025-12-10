<template>
  <div class="pt-40 pb-16 text-center">
    <h1 class="text-3xl font-black">Envie de jouer ?</h1>
    <h2 class="text-2xl">Trouvez des joueurs ou des événements sur boardy.</h2>
  </div>
  <div class="grid grid-cols-3 gap-6 px-40">
    <div class="bg-[#F7001F] p-8">
      <div class="flex">
        <IconBars class="text-[#F4FFFD]" />
        <p class="text-[#F4FFFD]">
          Trouvez des joueurs ou des événements sur boardy.
        </p>
      </div>
      <h3>Bars & Soirées</h3>
    </div>
    <div class="bg-[#F7001F] p-8">
      <div>
        <IconGamers class="text-[#F4FFFD]" />
      </div>
      <h3>Par des joueurs</h3>
    </div>
    <div class="bg-[#F7001F] p-8">
      <div>
        <IconEvents class="text-[#F4FFFD]" />
      </div>
      <h3>Festivals & conventions</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBars from "../components/atoms/icons/IconBars.vue";
import IconEvents from "../components/atoms/icons/IconEvents.vue";
import IconGamers from "../components/atoms/icons/IconGamers.vue";
</script>
