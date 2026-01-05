<template>
  <div class="pt-40 pb-16 text-center">
    <div class="container mx-auto px-4">
      <h1 class="text-5xl font-bold text-custom-blue mb-8">
        Participation confirmée ! 🎉
      </h1>

      <p class="text-2xl text-gray-700 mb-12">
        Vous êtes maintenant inscrit à cet événement.
      </p>

      <div class="flex gap-4 justify-center">
        <router-link
          to="/"
          class="bg-custom-blue text-custom-white px-8 py-4 rounded-lg hover:bg-custom-blue-hover text-xl font-bold"
        >
          Retour à l'accueil
        </router-link>

        <button
          @click="$router.back()"
          class="bg-custom-red text-custom-white px-8 py-4 rounded-lg hover:bg-red-600 text-xl font-bold"
        >
          Voir l'activité
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
