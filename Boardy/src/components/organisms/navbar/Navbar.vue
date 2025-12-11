<template>
  <nav class="fixed top-0 left-0 right-0 z-20 bg-custom-blue px-8 py-6">
    <div class="container mx-auto flex justify-between items-center">
      <div class="text-2xl font-bold">
        <router-link to="/" class="text-primary hover:text-gray-300">
          <img
            class="logo"
            src="/img/icon/boardy-logo-white.svg"
            alt="Boardy Logo"
          />
        </router-link>
      </div>
      <ul class="flex space-x-4 gap-7">
        <li v-if="authStore.isLogged">
          <router-link
            to="/my_events"
            class="text-custom-white hover:cursor-pointer hover:text-gray-300"
          >
            Mes événenements
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <router-link
            to="/account"
            class="text-custom-white hover:cursor-pointer hover:text-gray-300"
          >
            Mon profil
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <button
            @click="authStore.logout()"
            class="text-custom-white hover:cursor-pointer hover:text-gray-300"
          >
            Déconnexion
          </button>
        </li>
        <li v-if="!authStore.isLogged">
          <router-link
            to="/register"
            class="text-custom-white hover:cursor-pointer hover:text-gray-300"
          >
            Inscription
          </router-link>
        </li>
        <li v-if="!authStore.isLogged">
          <router-link
            to="/login"
            class="text-custom-white hover:cursor-pointer hover:text-gray-300"
          >
            Connexion
          </router-link>
        </li>
        <li>
          <router-link
            to="/create_event"
            class="hover:cursor-pointer hover:bg-custom-green-hover bg-custom-green text-primary px-6 py-3 rounded-2xl"
            >Créer un événement
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuth } from "../../../stores/authStore";
const authStore = useAuth();
</script>
