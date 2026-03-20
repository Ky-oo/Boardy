<template>
  <footer
    class="bg-custom-orange text-custom-primary p-4 text-center z-10 py-8"
  >
    <!-- <div class="flex justify-center">
      <img
        class="logo-footer w-xl"
        src="/img/icon/boardy-red.svg"
        alt="Boardy Logo"
      />
    </div> -->
    <div class="flex flex-col items-center gap-5 mt-2">
      <router-link
        to="/mentions-legales"
        class="inline-block px-4 py-2 rounded bg-custom-blue text-custom-white hover:bg-custom-blue-hover transition-colors text-sm"
      >
        Mentions légales
      </router-link>
      <router-link
        to="/politique-confidentialite"
        class="inline-block px-4 py-2 rounded bg-custom-blue text-custom-white hover:bg-custom-blue-hover transition-colors text-sm"
      >
        Politique de confidentialité
      </router-link>
    </div>
    <p class="text-white pt-4">&copy; 2025 Playly. Tous droits réservés.</p>
    
  </footer>
</template>

<script setup lang="ts"></script>
