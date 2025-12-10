<template>
  <nav
    m-xfixed
    top-0
    left-0
    right-0
    class="fixed top-0 left-0 right-0 bg-blue-700 px-5 py-8 z-10"
  >
    <div class="container mx-auto flex justify-between items-center">
      <div class="text-2xl font-bold">
        <router-link to="/" class="text-white hover:text-gray-300"
          >BOARDY</router-link
        >
      </div>
      <ul class="flex space-x-4">
        <li>
          <router-link
            to="/"
            class="text-white hover:cursor-pointer hover:text-gray-300"
          >
            Mes événenement
          </router-link>
        </li>
        <li>
          <router-link
            to="/account"
            class="text-white hover:cursor-pointer hover:text-gray-300"
          >
            Mon profile
          </router-link>
        </li>
        <li>
          <router-link
            to="/create_event"
            class="hover:cursor-pointer hover:text-gray-300 bg-green-300 text-black px-6 py-3 rounded-2xl"
            >Créer un évenement
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>
