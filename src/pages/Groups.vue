<template>
  <div class="min-h-screen bg-custom-bg pt-32 pb-16 px-5 md:px-20">
    <div class="text-center mb-10">
      <h1 class="text-5xl font-family-urban text-primary my-6">Groupes</h1>
      <p class="text-primary text-lg font-family-red-hat">
        Rejoignez des groupes de joueurs et organisez des parties entre membres.
      </p>
    </div>

    <div class="max-w-5xl mx-auto">
      <!-- Create group -->
      <div
        v-if="authStore.isLogged"
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h2 class="text-2xl font-bold text-primary">Mes groupes</h2>
        <button
          class="px-6 py-3 bg-custom-blue hover:cursor-pointer text-white rounded-xl hover:bg-custom-blue-hover font-semibold"
          @click="showCreateModal = true"
        >
          Créer un groupe
        </button>
      </div>

      <!-- My groups -->
      <div v-if="authStore.isLogged" class="mb-16">
        <div v-if="groupStore.loading" class="text-center text-gray-500 py-6">
          Chargement...
        </div>
        <div
          v-else-if="groupStore.myGroups.length === 0"
          class="text-center py-6"
        >
          <p class="text-gray-600">
            Vous n'êtes membre d'aucun groupe pour le moment.
          </p>
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <router-link
            v-for="group in groupStore.myGroups"
            :key="group.id"
            :to="`/group/${group.id}`"
            class="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center gap-4 mb-3">
              <div
                class="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white font-bold text-lg"
              >
                {{ group.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-lg font-bold text-custom-blue truncate">
                  {{ group.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ group.members.length }} membre{{
                    group.members.length > 1 ? "s" : ""
                  }}
                </p>
              </div>
            </div>
            <p
              v-if="group.description"
              class="text-sm text-gray-600 line-clamp-2"
            >
              {{ group.description }}
            </p>
            <span
              class="inline-block mt-3 text-xs px-3 py-1 rounded-full"
              :class="
                group.is_public
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              "
            >
              {{ group.is_public ? "Public" : "Privé" }}
            </span>
          </router-link>
        </div>
      </div>

      <!-- Public groups -->
      <h2 class="text-2xl font-bold text-primary mb-6">Groupes publics</h2>
      <div v-if="groupStore.loading" class="text-center text-gray-500 py-6">
        Chargement...
      </div>
      <div v-else-if="publicGroups.length === 0" class="text-center py-6">
        <p class="text-gray-600">Aucun groupe public pour le moment.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="group in publicGroups"
          :key="group.id"
          :to="`/group/${group.id}`"
          class="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center gap-4 mb-3">
            <div
              class="w-12 h-12 rounded-full bg-custom-orange flex items-center justify-center text-white font-bold text-lg"
            >
              {{ group.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-lg font-bold text-custom-blue truncate">
                {{ group.name }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ group.members.length }} membre{{
                  group.members.length > 1 ? "s" : ""
                }}
              </p>
            </div>
          </div>
          <p
            v-if="group.description"
            class="text-sm text-gray-600 line-clamp-2"
          >
            {{ group.description }}
          </p>
        </router-link>
      </div>
    </div>

    <!-- Create group modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 class="text-xl font-bold text-primary mb-4">Créer un groupe</h3>
        <form @submit.prevent="handleCreate">
          <div class="flex flex-col gap-2 mb-3">
            <label for="group-name" class="text-primary font-medium"
              >Nom du groupe*</label
            >
            <input
              id="group-name"
              v-model.trim="createForm.name"
              type="text"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div class="flex flex-col gap-2 mb-3">
            <label for="group-desc" class="text-primary font-medium"
              >Description</label
            >
            <textarea
              id="group-desc"
              v-model.trim="createForm.description"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 placeholder-gray-500 focus:outline-none resize-none"
            />
          </div>
          <div class="flex items-center gap-2 mb-4">
            <input
              id="group-public"
              v-model="createForm.is_public"
              type="checkbox"
              class="w-4 h-4"
            />
            <label for="group-public" class="text-primary text-sm"
              >Groupe public</label
            >
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 hover:cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300"
              @click="showCreateModal = false"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="groupStore.loading"
              class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ groupStore.loading ? "Création..." : "Créer" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useGroupStore } from "@/stores/groupStore";
import { useAuthStore } from "@/stores/authStore";

const groupStore = useGroupStore();
const authStore = useAuthStore();
const router = useRouter();

const showCreateModal = ref(false);
const createForm = reactive({
  name: "",
  description: "",
  is_public: true,
});

const publicGroups = computed(() =>
  groupStore.groups.filter((g) => g.is_public),
);

const handleCreate = async () => {
  if (!createForm.name.trim()) return;
  try {
    const group = await groupStore.createGroup({
      name: createForm.name,
      description: createForm.description || undefined,
      is_public: createForm.is_public,
    });
    showCreateModal.value = false;
    createForm.name = "";
    createForm.description = "";
    createForm.is_public = true;
    router.push(`/group/${group.id}`);
  } catch {
    // toast handled by store
  }
};

onMounted(async () => {
  await groupStore.fetchGroups();
  if (authStore.isLogged) {
    await groupStore.fetchMyGroups();
  }
});
</script>
