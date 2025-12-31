<template>
  <nav class="fixed top-0 left-0 right-0 z-20 bg-custom-bg px-8 py-4">
    <div class="container mx-auto flex items-center justify-between">
      <div class="text-2xl font-bold flex items-center">
        <router-link to="/" class="text-primary hover:text-gray-300">
          <img
            class="logo fill-custom-blue"
            src="/img/icon/boardy-logo-blue.svg"
            alt="Boardy Logo"
          />
        </router-link>
      </div>

      <!-- Desktop menu -->
      <ul class="hidden xl:flex space-x-4 gap-7 items-center">
        <li v-if="authStore.isLogged">
          <router-link
            to="/my_events"
            class="text-primary hover:cursor-pointer hover:text-gray-300"
          >
            Mes événenements
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <router-link
            to="/profile"
            class="text-primary hover:cursor-pointer hover:text-gray-300"
          >
            Mon profil
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <router-link
            to="/organisation"
            class="text-primary hover:cursor-pointer hover:text-gray-300"
          >
            Mon organisation
          </router-link>
        </li>
        <li v-if="authStore.user?.role === 'admin'">
          <router-link
            to="/admin"
            class="text-primary hover:cursor-pointer hover:text-gray-300"
          >
            Admin
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <button
            @click="authStore.logout()"
            class="text-primary hover:cursor-pointer hover:text-gray-300"
          >
            Déconnexion
          </button>
        </li>
        <li v-if="!authStore.isLogged">
          <router-link
            to="/register"
            class="text-primary hover:cursor-pointer hover:text-gray-300"
          >
            Inscription
          </router-link>
        </li>
        <li v-if="!authStore.isLogged">
          <router-link
            to="/login"
            class="text-primary hover:cursor-pointer hover:text-gray-300"
          >
            Connexion
          </router-link>
        </li>
        <li>
          <router-link
            :to="authStore.isLogged ? '/create_event' : '/login'"
            class="hover:cursor-pointer hover:bg-custom-blue-hover bg-custom-blue text-custom-white px-6 py-3 rounded-2xl"
            >Créer un événement
          </router-link>
        </li>
      </ul>

      <!-- Mobile burger button -->
      <button
        type="button"
        class="xl:hidden inline-flex items-center justify-center rounded-xl p-2 text-primary hover:text-gray-300"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Ouvrir le menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <span class="sr-only">Menu</span>
        <span class="relative block h-5 w-6">
          <span
            class="absolute left-0 top-0 h-0.5 w-6 bg-primary transition"
            :class="isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''"
          />
          <span
            class="absolute left-0 top-2 h-0.5 w-6 bg-primary transition"
            :class="isMobileMenuOpen ? 'opacity-0' : ''"
          />
          <span
            class="absolute left-0 top-4 h-0.5 w-6 bg-primary transition"
            :class="isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''"
          />
        </span>
      </button>
    </div>

    <!-- Mobile menu panel -->
    <div v-if="isMobileMenuOpen" class="xl:hidden container mx-auto pt-4">
      <ul class="flex flex-col gap-4">
        <li v-if="authStore.isLogged">
          <router-link
            to="/my_events"
            class="block text-primary hover:cursor-pointer hover:text-gray-300"
            @click="closeMobileMenu"
          >
            Mes événenements
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <router-link
            to="/profile"
            class="block text-primary hover:cursor-pointer hover:text-gray-300"
            @click="closeMobileMenu"
          >
            Mon profil
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <router-link
            to="/organisation"
            class="block text-primary hover:cursor-pointer hover:text-gray-300"
            @click="closeMobileMenu"
          >
            Mon organisation
          </router-link>
        </li>
        <li v-if="authStore.user?.role === 'admin'">
          <router-link
            to="/admin"
            class="block text-primary hover:cursor-pointer hover:text-gray-300"
            @click="closeMobileMenu"
          >
            Admin
          </router-link>
        </li>
        <li v-if="authStore.isLogged">
          <button
            class="text-left text-primary hover:cursor-pointer hover:text-gray-300"
            @click="handleLogout"
          >
            Déconnexion
          </button>
        </li>
        <li v-if="!authStore.isLogged">
          <router-link
            to="/register"
            class="block text-primary hover:cursor-pointer hover:text-gray-300"
            @click="closeMobileMenu"
          >
            Inscription
          </router-link>
        </li>
        <li v-if="!authStore.isLogged">
          <router-link
            to="/login"
            class="block text-primary hover:cursor-pointer hover:text-gray-300"
            @click="closeMobileMenu"
          >
            Connexion
          </router-link>
        </li>
        <li>
          <router-link
            :to="authStore.isLogged ? '/create_event' : '/login'"
            class="inline-flex w-fit hover:cursor-pointer hover:bg-custom-blue-hover bg-custom-blue text-custom-white px-6 py-3 rounded-2xl"
            @click="closeMobileMenu"
          >
            Créer un événement
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../../../stores/authStore";
const authStore = useAuth();

const isMobileMenuOpen = ref(false);

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  closeMobileMenu();
};
</script>