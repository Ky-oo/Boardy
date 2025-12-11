<template>
  <div class="min-h-screen bg-white bloc-cat-login">
    <div class="text-center pt-30 pb-8">
      <h1 class="text-5xl font-family-urban text-black mb-2">Connexion</h1>
      <p class="text-black text-lg font-family-red-hat">
        Créez et participez à des événements avec votre compte Boardy.
      </p>
    </div>

    <div class="flex justify-center items-start gap-16 px-8 pb-16">
      <div class="relative pt-6">
        <div
          class="absolute -top-1 -right-6 w-full h-full border-2 border-red-500 rounded-lg"
        ></div>
        <img
          src="/img/login/login_image.png"
          alt="Personnes jouant à un jeu de société"
          class="relative w-[500px] h-[400px] object-cover rounded-lg z-10"
        />
      </div>

      <div class="bg-custom-blue rounded-3xl p-8 w-[500px] z-10">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-custom-white font-medium"
              >Email</label
            >
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Entrez votre email"
              required
              class="w-full h-8 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-white"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="text-custom-white font-medium"
              >Mot de passe</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              required
              class="w-full h-8 px-4 py-3 rounded-xl bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none focus:border-white"
            />
          </div>

          <div class="text-right">
            <a
              href="#"
              class="text-custom-white text-sm underline hover:no-underline"
              >Mot de passe oublié ?</a
            >
          </div>

          <div v-if="error" class="text-red-200 text-sm text-center">
            {{ error }}
          </div>

          <button
            type="submit"
            class="w-full h-8 hover:cursor-pointer hover:bg-custom-green-hover text-gray-800 font-semibold rounded-xl bg-custom-green transition-colors"
            :disabled="loading"
          >
            {{ loading ? "Connexion..." : "Se connecter" }}
          </button>

          <div class="flex items-center gap-4 mt-2">
            <div class="flex-1 h-px bg-white/50"></div>
            <span class="text-custom-white text-sm">Ou se connecter avec</span>
            <div class="flex-1 h-px bg-white/50"></div>
          </div>

          <div class="flex justify-center gap-6">
            <button
              type="button"
              class="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <IconGoogle class="text-custom-white w-10 h-10" />
            </button>
            <button
              type="button"
              class="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <IconApple class="text-custom-white w-10 h-10" />
            </button>
            <button
              type="button"
              class="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <IconFacebook class="text-custom-white w-10 h-10" />
            </button>
          </div>

          <button
            type="button"
            class="w-full bg-white text-primary font-semibold rounded-xl h-10 hover:cursor-pointer hover:bg-gray-200 transition-colors mt-2"
            @click="router.push('/register')"
          >
            Je n'ai pas de compte
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/stores/authStore";
import IconGoogle from "@/components/atoms/icons/IconGoogle.vue";
import IconApple from "@/components/atoms/icons/IconApple.vue";
import IconFacebook from "@/components/atoms/icons/IconFacebook.vue";

const router = useRouter();
const authStore = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    await authStore.login(email.value, password.value);
  } catch (e: any) {
    error.value = e.message || "Erreur de connexion";
  } finally {
    loading.value = false;
  }
};
</script>
