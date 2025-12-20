<template>
  <div class="bg-custom-green rounded-xl p-8">
    <div class="flex justify-between items-center pb-4">
      <div>
        <h2 class="text-2xl font-bold text-custom-primary">
          Chat de l'événement
        </h2>
      </div>
      <div
        :class="[
          'text-sm font-semibold',
          isConnected ? 'text-green-700' : 'text-red-600',
        ]"
      >
        {{ isConnected ? "Connecté" : "Hors ligne" }}
      </div>
    </div>

    <div
      class="bg-custom-white p-4 rounded-2xl h-96 flex flex-col gap-2 overflow-y-auto"
    >
      <div v-if="messages.length === 0" class="text-gray-500 text-center py-6">
        Aucun message pour le moment.
      </div>
      <div
        v-for="message in messages"
        :key="message.id || message.tempId"
        class="flex flex-col"
        :class="{
          'items-end': message.userId === user.id,
          'items-start': message.userId !== user.id,
        }"
      >
        <div
          class="px-4 py-2 rounded-lg max-w-xl"
          :class="
            message.userId === user.id
              ? 'bg-custom-blue text-white'
              : 'bg-gray-100 text-gray-800'
          "
        >
          <div class="flex items-start justify-between gap-2 mb-1">
            <p class="text-xs font-semibold">
              {{ message.userName || "Anonyme" }}
            </p>
            <button
              v-if="message.userId === user.id && message.id"
              type="button"
              class="text-[10px] opacity-80 hover:opacity-100 hover:cursor-pointer text-white underline-offset-2"
              @click="deleteMessage(message)"
            >
              Supprimer
            </button>
          </div>
          <p class="whitespace-pre-wrap">{{ message.content }}</p>
          <p class="text-[10px] mt-1 opacity-80">
            {{ formatTime(message.createdAt) }}
            <span v-if="message.userId === user.id">
              • {{ message.seenBy?.length ? "Vu" : "Envoyé" }}
            </span>
          </p>
        </div>
        <div
          v-if="message.userId === user.id && message.seenBy?.length"
          class="text-[10px] text-gray-500 mt-0.5"
        >
          Vu par {{ message.seenBy.length }} participant(s)
        </div>
      </div>
      <p class="text-sm text-gray-700" v-if="typingUsersLabel">
        {{ typingUsersLabel }}
      </p>
    </div>

    <div class="relative mt-4">
      <input
        v-model="messageInput"
        type="text"
        placeholder="Écrire un message..."
        class="w-full p-4 pr-14 bg-custom-white rounded-2xl outline-none focus:ring-2 focus:ring-custom-primary"
        @keydown.enter.prevent="sendMessage"
        @input="handleTyping"
      />
      <button
        class="absolute right-3 top-1/2 -translate-y-1/2 bg-custom-blue p-2 rounded-lg hover:cursor-pointer disabled:opacity-50"
        @click="sendMessage"
        :disabled="!messageInput.trim() || !isConnected"
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import IconSend from "@/components/atoms/icons/IconSend.vue";

type ChatMessage = {
  id?: number;
  tempId?: string;
  userId: number;
  userName?: string;
  content: string;
  createdAt: string;
  seenBy?: number[];
};

const props = defineProps<{
  activityId: number;
  user: { id: number; firstname?: string; lastname?: string; pseudo?: string };
  token?: string | null;
}>();

const ws = ref<WebSocket | null>(null);
const messages = ref<ChatMessage[]>([]);
const messageInput = ref("");
const isConnected = ref(false);
const typingUsers = ref<Set<number>>(new Set());
const error = ref("");
const typingInterval = ref<number | null>(null);

const removeMessagesByIds = (ids: (number | string)[]) => {
  if (!ids?.length) return;
  const toDelete = new Set(ids.map((id) => id.toString()));
  messages.value = messages.value.filter((m) => {
    const identifier = m.id ?? m.tempId;
    if (!identifier) return true;
    return !toDelete.has(identifier.toString());
  });
};

const sendTyping = () => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  const payload = {
    type: "typing",
    activityId: props.activityId,
    token: props.token,
  };
  ws.value.send(JSON.stringify(payload));
};

const startTypingLoop = () => {
  if (typingInterval.value !== null) return;
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  sendTyping();
  typingInterval.value = window.setInterval(sendTyping, 1500);
};

const stopTypingLoop = () => {
  if (typingInterval.value === null) return;
  clearInterval(typingInterval.value);
  typingInterval.value = null;
};

const handleTyping = () => {
  const hasContent = messageInput.value.trim().length > 0;
  if (hasContent) {
    startTypingLoop();
  } else {
    stopTypingLoop();
  }
};

const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;

const typingUsersLabel = computed(() => {
  const names: string[] = [];
  typingUsers.value.forEach((id) => {
    if (id === props.user.id) return;
    const found = messages.value.find((m) => m.userId === id);
    if (found?.userName) names.push(found.userName);
  });
  if (!names.length) return "";
  if (names.length === 1) return `${names[0]} est en train d'écrire...`;
  return `${names.join(", ")} sont en train d'écrire...`;
});

const connect = () => {
  if (!wsUrl) {
    error.value = "WebSocket URL non défini";
    return;
  }
  try {
    ws.value = new WebSocket(wsUrl);
    ws.value.onopen = () => {
      isConnected.value = true;
      error.value = "";
      const payload = {
        type: "join",
        activityId: props.activityId,
        token: props.token,
      };
      ws.value?.send(JSON.stringify(payload));
      if (messageInput.value.trim()) startTypingLoop();
    };

    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "history":
            if (Array.isArray(data.messages)) {
              messages.value = data.messages;
            }
            break;
          case "message":
            if (!data.message) break;
            const incoming: ChatMessage = data.message;

            const existingIndex = messages.value.findIndex(
              (m) =>
                (incoming.id && m.id === incoming.id) ||
                (incoming.tempId && m.tempId === incoming.tempId)
            );

            if (existingIndex !== -1) {
              const updated = [...messages.value];
              updated[existingIndex] = {
                ...updated[existingIndex],
                ...incoming,
              };
              messages.value = updated;
            } else {
              const tempIndex = messages.value.findIndex(
                (m) =>
                  !m.id &&
                  m.userId === incoming.userId &&
                  m.content === incoming.content
              );

              if (tempIndex !== -1) {
                const updated = [...messages.value];
                updated[tempIndex] = incoming;
                messages.value = updated;
              } else {
                messages.value = [...messages.value, incoming];
              }
            }

            sendSeen([incoming.id]);
            break;
          case "delete":
          case "deleted":
            {
              const idsToRemove = Array.isArray(data.messageIds)
                ? data.messageIds
                : data.messageId
                ? [data.messageId]
                : [];
              removeMessagesByIds(idsToRemove);
            }
            break;
          case "typing":
            if (data.userId && data.userId !== props.user.id) {
              typingUsers.value.add(data.userId);
              setTimeout(() => typingUsers.value.delete(data.userId), 2000);
            }
            break;
          case "seen":
            if (Array.isArray(data.messageIds) && data.userId) {
              messages.value = messages.value.map((m) =>
                data.messageIds.includes(m.id || m.tempId)
                  ? {
                      ...m,
                      seenBy: Array.from(
                        new Set([...(m.seenBy || []), data.userId])
                      ),
                    }
                  : m
              );
            }
            break;
          default:
            break;
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.value.onerror = () => {
      error.value = "Connexion WebSocket échouée";
    };

    ws.value.onclose = () => {
      isConnected.value = false;
      setTimeout(connect, 2000); // retry simple
    };
  } catch (e: any) {
    error.value = e?.message || "Erreur WebSocket";
  }
};

const sendMessage = () => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  const content = messageInput.value.trim();
  if (!content) return;

  const payload = {
    type: "message",
    activityId: props.activityId,
    token: props.token,
    content,
  };
  ws.value.send(JSON.stringify(payload));
  const temp: ChatMessage = {
    tempId: crypto.randomUUID(),
    userId: props.user.id,
    userName:
      props.user.pseudo ||
      `${props.user.firstname || ""} ${props.user.lastname || ""}`.trim(),
    content,
    createdAt: new Date().toISOString(),
    seenBy: [props.user.id],
  };
  messages.value = [...messages.value, temp];
  messageInput.value = "";
};

watch(messageInput, () => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  const payload = {
    type: "typing",
    activityId: props.activityId,
    token: props.token,
  };
  ws.value.send(JSON.stringify(payload));
});

const deleteMessage = (message: ChatMessage) => {
  if (message.userId !== props.user.id) return;
  if (!message.id) return;
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    error.value = "Connexion WebSocket indisponible";
    return;
  }
  const confirmed = window.confirm("Supprimer ce message ?");
  if (!confirmed) return;

  const payload = {
    type: "delete",
    activityId: props.activityId,
    token: props.token,
    messageId: message.id,
  };

  try {
    ws.value.send(JSON.stringify(payload));
    removeMessagesByIds([message.id]);
  } catch (e) {
    error.value = "Suppression impossible pour l'instant";
  }
};

const sendSeen = (messageIds: (number | string | undefined)[]) => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  const filtered = messageIds.filter(Boolean);
  if (!filtered.length) return;
  const payload = {
    type: "seen",
    activityId: props.activityId,
    token: props.token,
    messageIds: filtered,
  };
  ws.value.send(JSON.stringify(payload));
};

watch(
  () => props.activityId,
  () => {
    messages.value = [];
    connect();
  }
);

onMounted(() => {
  connect();
});

onBeforeUnmount(() => {
  ws.value?.close();
});

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
</script>
