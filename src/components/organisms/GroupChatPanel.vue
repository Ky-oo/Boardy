<template>
  <div class="bg-custom-orange rounded-xl p-8">
    <div class="flex justify-between items-center pb-4">
      <h2 class="text-2xl font-bold text-custom-primary">Chat du groupe</h2>
    </div>

    <div
      ref="messagesContainerRef"
      class="bg-custom-white p-4 rounded-2xl h-96 flex flex-col gap-2 overflow-y-auto"
    >
      <div v-if="loadingMore" class="text-center text-gray-400 text-sm py-2">
        Chargement...
      </div>
      <button
        v-else-if="hasMore"
        class="text-center text-custom-blue text-sm py-2 hover:underline hover:cursor-pointer"
        @click="loadOlderMessages"
      >
        Charger les messages précédents
      </button>
      <div
        v-if="groupStore.messages.length === 0 && !loadingMore"
        class="text-gray-500 text-center py-6"
      >
        Aucun message pour le moment.
      </div>
      <div
        v-for="message in groupStore.messages"
        :key="message.id"
        class="flex flex-col"
        :class="{
          'items-end': message.sender_id === user.id,
          'items-start': message.sender_id !== user.id,
        }"
      >
        <div
          v-if="message.is_deleted"
          class="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 italic"
        >
          Message supprimé
        </div>
        <template v-else>
          <div
            v-if="message.replyTo"
            class="text-xs text-gray-400 mb-1 px-2 border-l-2 border-custom-blue"
          >
            En réponse à {{ message.replyTo.sender?.pseudo || "Anonyme" }} :
            <span class="italic">{{
              message.replyTo.is_deleted
                ? "Message supprimé"
                : message.replyTo.content.substring(0, 60)
            }}</span>
          </div>
          <div
            class="px-4 py-2 rounded-lg max-w-xl"
            :class="
              message.sender_id === user.id
                ? 'bg-custom-blue text-white'
                : 'bg-gray-100 text-gray-800'
            "
          >
            <div class="flex items-start justify-between gap-2 mb-1">
              <p class="text-xs font-semibold">
                {{ message.sender?.pseudo || "Anonyme" }}
              </p>
              <button
                v-if="canDeleteMessage(message)"
                type="button"
                class="text-[10px] opacity-80 hover:opacity-100 hover:cursor-pointer underline-offset-2"
                :class="
                  message.sender_id === user.id ? 'text-white' : 'text-red-500'
                "
                @click="handleDelete(message.id)"
              >
                Supprimer
              </button>
            </div>
            <p class="whitespace-pre-wrap">{{ message.content }}</p>
            <p class="text-[10px] mt-1 opacity-80">
              {{ formatTime(message.send_at) }}
            </p>
          </div>
          <button
            class="text-[10px] text-gray-400 hover:text-custom-blue hover:cursor-pointer mt-0.5"
            @click="replyTo = message"
          >
            Répondre
          </button>
        </template>
      </div>
    </div>

    <div
      v-if="replyTo"
      class="mt-2 px-4 py-2 bg-gray-100 rounded-lg flex justify-between items-center"
    >
      <span class="text-sm text-gray-600">
        Réponse à {{ replyTo.sender?.pseudo }} :
        <span class="italic">{{ replyTo.content.substring(0, 50) }}</span>
      </span>
      <button
        class="text-sm text-red-500 hover:cursor-pointer"
        @click="replyTo = null"
      >
        Annuler
      </button>
    </div>

    <div class="relative mt-4">
      <input
        v-model="messageInput"
        type="text"
        placeholder="Écrire un message..."
        class="w-full p-4 pr-14 bg-custom-white rounded-2xl outline-none focus:ring-2 focus:ring-custom-primary"
        @keydown.enter.prevent="handleSend"
      />
      <button
        class="absolute right-3 top-1/2 -translate-y-1/2 bg-custom-blue p-2 rounded-lg hover:cursor-pointer disabled:opacity-50"
        @click="handleSend"
        :disabled="!messageInput.trim()"
      >
        <IconSend class="text-custom-white w-5 h-5" />
      </button>
    </div>

    <div v-if="error" class="text-red-600 text-sm mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { useGroupStore } from "@/stores/groupStore";
import IconSend from "@/components/atoms/icons/IconSend.vue";
import type { GroupMessage } from "@/types/Group";

const props = defineProps<{
  groupId: number;
  user: { id: number; pseudo?: string };
  isOwnerOrAdmin: boolean;
}>();

const groupStore = useGroupStore();
const messageInput = ref("");
const replyTo = ref<GroupMessage | null>(null);
const error = ref("");
const loadingMore = ref(false);
const hasMore = ref(true);
const messagesContainerRef = ref<HTMLDivElement | null>(null);

const canDeleteMessage = (message: GroupMessage) => {
  return message.sender_id === props.user.id || props.isOwnerOrAdmin;
};

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const scrollToBottom = () => {
  const container = messagesContainerRef.value;
  if (!container) return;
  container.scrollTop = container.scrollHeight;
};

const loadMessages = async () => {
  try {
    const msgs = await groupStore.fetchMessages(props.groupId);
    hasMore.value = msgs.length >= 50;
    await nextTick();
    scrollToBottom();
  } catch {
    error.value = "Impossible de charger les messages.";
  }
};

const loadOlderMessages = async () => {
  if (loadingMore.value || groupStore.messages.length === 0) return;
  loadingMore.value = true;
  try {
    const oldestId = groupStore.messages[0]?.id;
    const msgs = await groupStore.fetchMessages(props.groupId, oldestId);
    hasMore.value = msgs.length >= 50;
  } catch {
    error.value = "Impossible de charger les messages.";
  } finally {
    loadingMore.value = false;
  }
};

const handleSend = async () => {
  const content = messageInput.value.trim();
  if (!content) return;
  try {
    await groupStore.sendMessage(props.groupId, content, replyTo.value?.id);
    messageInput.value = "";
    replyTo.value = null;
    await nextTick();
    scrollToBottom();
  } catch {
    error.value = "Impossible d'envoyer le message.";
  }
};

const handleDelete = async (messageId: number) => {
  const confirmed = window.confirm("Supprimer ce message ?");
  if (!confirmed) return;
  try {
    await groupStore.deleteMessage(props.groupId, messageId);
  } catch {
    error.value = "Impossible de supprimer le message.";
  }
};

watch(
  () => props.groupId,
  () => {
    groupStore.messages = [];
    loadMessages();
  },
);

onMounted(loadMessages);
</script>
