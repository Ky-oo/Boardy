<template>
  <div class="min-h-screen bg-custom-bg pt-20 pb-16">
    <div
      v-if="groupStore.loading && !groupStore.currentGroup"
      class="text-center py-8"
    >
      <p class="text-gray-600">Chargement du groupe...</p>
    </div>

    <div
      v-else-if="groupStore.error && !groupStore.currentGroup"
      class="text-center py-8"
    >
      <p class="text-red-600">{{ groupStore.error }}</p>
    </div>

    <div v-else-if="groupStore.currentGroup" class="lg:mx-30 py-6 px-5">
      <button
        @click="$router.back()"
        class="flex items-center text-custom-primary text-2xl py-3 hover:cursor-pointer mb-6"
      >
        <IconChevronLeft class="mr-2" /> Retour
      </button>

      <!-- Header -->
      <div class="container mx-auto mb-8">
        <div class="bg-custom-blue rounded-xl p-8 text-white">
          <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 class="text-3xl font-black mb-2">
                {{ groupStore.currentGroup.name }}
              </h1>
              <p
                v-if="groupStore.currentGroup.description"
                class="text-lg opacity-90"
              >
                {{ groupStore.currentGroup.description }}
              </p>
              <div class="flex items-center gap-4 mt-3">
                <span class="text-sm">
                  <IconParticipants class="inline w-4 h-4 mr-1" />
                  {{ groupStore.currentGroup.members.length }} membre{{
                    groupStore.currentGroup.members.length > 1 ? "s" : ""
                  }}
                </span>
                <span
                  class="text-xs px-3 py-1 rounded-full"
                  :class="
                    groupStore.currentGroup.is_public
                      ? 'bg-green-500/30 text-green-200'
                      : 'bg-orange-500/30 text-orange-200'
                  "
                >
                  {{ groupStore.currentGroup.is_public ? "Public" : "Privé" }}
                </span>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                v-if="
                  !isMember &&
                  groupStore.currentGroup.is_public &&
                  authStore.isLogged
                "
                @click="handleJoin"
                class="px-6 py-3 bg-white hover:cursor-pointer text-custom-blue rounded-lg hover:bg-custom-green font-bold"
              >
                Rejoindre le groupe
              </button>
              <button
                v-if="!isMember && !authStore.isLogged"
                @click="$router.push('/login')"
                class="px-6 py-3 bg-white hover:cursor-pointer text-custom-blue rounded-lg hover:bg-custom-green font-bold"
              >
                Connectez-vous pour rejoindre
              </button>
              <button
                v-if="isOwnerOrAdmin"
                @click="showEditModal = true"
                class="px-4 py-2 bg-custom-orange hover:cursor-pointer text-white rounded-lg hover:bg-custom-orange-hover"
              >
                Modifier
              </button>
              <button
                v-if="isMember && !isOwner"
                @click="handleLeave"
                class="px-4 py-2 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600"
              >
                Quitter le groupe
              </button>
              <button
                v-if="authStore.user?.role === 'admin'"
                @click="handleDelete"
                class="px-4 py-2 bg-red-700 hover:cursor-pointer text-white rounded-lg hover:bg-red-800"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Members -->
      <div class="container mx-auto mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-primary">Membres</h2>
          <button
            v-if="isOwnerOrAdmin"
            @click="showInviteModal = true"
            class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover text-sm"
          >
            Inviter un membre
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="member in groupStore.currentGroup.members"
            :key="member.id"
            class="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-custom-orange flex items-center justify-center text-white font-bold"
              >
                {{ member.pseudo.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-primary">{{ member.pseudo }}</p>
                <p class="text-xs text-gray-500">
                  {{ member.firstname }} {{ member.lastname }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="{
                  'bg-blue-100 text-blue-700':
                    member.GroupMember.role === 'owner',
                  'bg-purple-100 text-purple-700':
                    member.GroupMember.role === 'admin',
                  'bg-gray-100 text-gray-600':
                    member.GroupMember.role === 'member',
                }"
              >
                {{ formatRole(member.GroupMember.role) }}
              </span>
              <button
                v-if="
                  isOwnerOrAdmin &&
                  member.id !== authStore.user?.id &&
                  member.GroupMember.role !== 'owner'
                "
                @click="handleRemoveMember(member.id)"
                class="text-red-500 text-xs hover:cursor-pointer hover:underline"
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Group activities -->
      <div v-if="isMember" class="container mx-auto mb-8">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
        >
          <h2 class="text-2xl font-bold text-primary">Activités du groupe</h2>
          <button
            @click="goToCreateEvent"
            class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover text-sm"
          >
            Créer une activité
          </button>
        </div>
        <div v-if="activitiesLoading" class="text-center text-gray-500 py-6">
          Chargement des activités...
        </div>
        <div v-else-if="activities.length === 0" class="text-center py-6">
          <p class="text-gray-600">Aucune activité dans ce groupe.</p>
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <ActivityCard
            v-for="activity in activities"
            :key="activity.id"
            :activity="activity"
          />
        </div>
      </div>

      <!-- Group chat -->
      <div v-if="isMember" class="container mx-auto">
        <GroupChatPanel
          :group-id="groupStore.currentGroup.id"
          :user="authStore.user!"
          :is-owner-or-admin="isOwnerOrAdmin"
          class="mt-8"
        />
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600">Groupe non trouvé</p>
    </div>

    <!-- Edit modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 class="text-xl font-bold text-primary mb-4">Modifier le groupe</h3>
        <form @submit.prevent="handleEdit">
          <div class="flex flex-col gap-2 mb-3">
            <label class="text-primary font-medium">Nom du groupe*</label>
            <input
              v-model.trim="editForm.name"
              type="text"
              required
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 focus:outline-none"
            />
          </div>
          <div class="flex flex-col gap-2 mb-3">
            <label class="text-primary font-medium">Description</label>
            <textarea
              v-model.trim="editForm.description"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 focus:outline-none resize-none"
            />
          </div>
          <div class="flex items-center gap-2 mb-4">
            <input
              v-model="editForm.is_public"
              type="checkbox"
              class="w-4 h-4"
            />
            <label class="text-primary text-sm">Groupe public</label>
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 hover:cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300"
              @click="showEditModal = false"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="groupStore.loading"
              class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Invite modal -->
    <div
      v-if="showInviteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="showInviteModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 class="text-xl font-bold text-primary mb-4">
          Inviter un utilisateur
        </h3>
        <form @submit.prevent="handleInvite">
          <div class="flex flex-col gap-2 mb-4">
            <label class="text-primary font-medium">ID de l'utilisateur</label>
            <input
              v-model.number="inviteUserId"
              type="number"
              required
              min="1"
              class="w-full h-10 px-4 py-3 rounded-xl border-[1.5px] border-custom-blue bg-custom-white text-gray-700 focus:outline-none"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 hover:cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300"
              @click="showInviteModal = false"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover"
            >
              Inviter
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGroupStore } from "@/stores/groupStore";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";
import { get } from "@/utils/api/api";
import type { Activity, ActivityWithHost } from "@/types/Activity";
import IconChevronLeft from "@/components/atoms/icons/IconChevronLeft.vue";
import IconParticipants from "@/components/atoms/icons/IconParticipants.vue";
import ActivityCard from "@/components/molecules/ActivityCard.vue";
import GroupChatPanel from "@/components/organisms/GroupChatPanel.vue";

const route = useRoute();
const router = useRouter();
const groupStore = useGroupStore();
const authStore = useAuthStore();
const activityStore = useActivityStore();

const showEditModal = ref(false);
const showInviteModal = ref(false);
const inviteUserId = ref<number | null>(null);
const activities = ref<ActivityWithHost[]>([]);
const activitiesLoading = ref(false);

const editForm = reactive({
  name: "",
  description: "",
  is_public: true,
});

const isMember = computed(() => {
  if (!authStore.user) return false;
  return groupStore.isMember(authStore.user.id);
});

const isOwner = computed(() => {
  if (!authStore.user) return false;
  return groupStore.getMemberRole(authStore.user.id) === "owner";
});

const isOwnerOrAdmin = computed(() => {
  if (!authStore.user) return false;
  if (authStore.user.role === "admin") return true;
  return groupStore.isOwnerOrAdmin(authStore.user.id);
});

const formatRole = (role: string) => {
  if (role === "owner") return "Créateur";
  if (role === "admin") return "Admin";
  return "Membre";
};

const loadActivities = async (groupId: number) => {
  activitiesLoading.value = true;
  try {
    const response = await get(`/group/${groupId}/activities`);
    const rows: Activity[] = Array.isArray(response)
      ? response
      : response?.data || [];
    activities.value = rows.map((a) => activityStore.normalizeActivity(a));
  } catch {
    activities.value = [];
  } finally {
    activitiesLoading.value = false;
  }
};

const handleJoin = async () => {
  if (!groupStore.currentGroup) return;
  try {
    await groupStore.joinGroup(groupStore.currentGroup.id);
    await loadActivities(groupStore.currentGroup.id);
  } catch {
    // toast handled by store
  }
};

const handleLeave = async () => {
  if (!groupStore.currentGroup) return;
  const confirmed = window.confirm("Voulez-vous quitter ce groupe ?");
  if (!confirmed) return;
  try {
    await groupStore.leaveGroup(groupStore.currentGroup.id);
    router.push("/groups");
  } catch {
    // toast handled by store
  }
};

const handleDelete = async () => {
  if (!groupStore.currentGroup) return;
  const confirmed = window.confirm("Voulez-vous supprimer ce groupe ?");
  if (!confirmed) return;
  try {
    await groupStore.deleteGroup(groupStore.currentGroup.id);
    router.push("/groups");
  } catch {
    // toast handled by store
  }
};

const handleEdit = async () => {
  if (!groupStore.currentGroup) return;
  try {
    await groupStore.updateGroup(groupStore.currentGroup.id, {
      name: editForm.name,
      description: editForm.description || undefined,
      is_public: editForm.is_public,
    });
    showEditModal.value = false;
  } catch {
    // toast handled by store
  }
};

const handleInvite = async () => {
  if (!groupStore.currentGroup || !inviteUserId.value) return;
  try {
    await groupStore.inviteUser(groupStore.currentGroup.id, inviteUserId.value);
    showInviteModal.value = false;
    inviteUserId.value = null;
  } catch {
    // toast handled by store
  }
};

const handleRemoveMember = async (userId: number) => {
  if (!groupStore.currentGroup) return;
  const confirmed = window.confirm("Retirer ce membre du groupe ?");
  if (!confirmed) return;
  try {
    await groupStore.removeMember(groupStore.currentGroup.id, userId);
  } catch {
    // toast handled by store
  }
};

const goToCreateEvent = () => {
  if (!groupStore.currentGroup) return;
  router.push({
    path: "/create_event",
    query: { groupId: groupStore.currentGroup.id.toString() },
  });
};

const initPage = async (id: number) => {
  await groupStore.fetchGroup(id);
  if (groupStore.currentGroup) {
    editForm.name = groupStore.currentGroup.name;
    editForm.description = groupStore.currentGroup.description || "";
    editForm.is_public = groupStore.currentGroup.is_public;
    if (isMember.value) {
      await loadActivities(id);
    }
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) initPage(id);
});

watch(
  () => route.params.id,
  (newId) => {
    const id = Number(newId);
    if (id) {
      activities.value = [];
      initPage(id);
    }
  },
);
</script>
