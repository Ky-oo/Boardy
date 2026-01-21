<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
</script>

<template>
  <div class="bg-custom-blue">
    <div class="container mx-auto">
      <div
        class="flex flex-col md:flex-row items-center max-w-5xl w-full pt-24 pb-12 px-5 md:px-0"
      >
        <div class="w-full md:w-1/3 flex justify-center mb-8 md:mb-0">
          <div class="relative">
            <img src="/img/icon/1-blue.svg" alt="Créer une partie" />
          </div>
        </div>

        <div
          class="w-full md:w-2/3 flex flex-col items-center md:items-start space-y-4 text-custom-white text-center md:text-left"
        >
          <h2 class="text-3xl md:text-4xl font-bold">
            Envie de jouer à un jeu précis&nbsp;?
          </h2>
          <p class="text-lg opacity-90">
            Créer votre propre événement et laisser des joueurs y participer.
          </p>
          <router-link
            :to="authStore.isLogged ? '/create_event' : '/login'"
            class="text-xl font-bold hover:cursor-pointer hover:bg-custom-green-hover bg-custom-green text-primary px-6 py-3 rounded-2xl"
            >Je crée une partie
          </router-link>
        </div>
      </div>

      <div
        class="flex flex-col-reverse md:flex-row ml-auto items-center max-w-5xl w-full pt-12 pb-24 px-5 md:px-0"
      >
        <div
          class="w-full md:w-2/3 flex flex-col items-center md:items-end space-y-4 text-custom-white text-center md:text-right"
        >
          <h2 class="text-3xl md:text-4xl font-bold">
            Juste envie de jouer à n'importe quel jeu&nbsp;?
          </h2>
          <p class="text-lg opacity-90">
            Montrer aux joueurs autour de vous que vous êtes disponibles pour
            jouer à <br class="hidden md:block" />
            n'importe quel jeu ou a un certain type de jeu.
          </p>
          <router-link
            :to="authStore.isLogged ? '/create_event' : '/login'"
            class="text-xl font-bold hover:cursor-pointer hover:bg-custom-green-hover bg-custom-green text-primary px-6 py-3 rounded-2xl"
            >Je suis disponible
          </router-link>
        </div>

        <div class="w-full md:w-1/3 flex justify-center mb-8 md:mb-0">
          <div class="relative">
            <img src="/img/icon/2-blue.svg" alt="Se rendre disponible" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
