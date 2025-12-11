<template>
  <div>
    <!-- Floating Chat Button -->
    <button
      @click="toggleChat"
      class="fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors duration-200 z-50"
      aria-label="Ouvrir le chat"
    >
      💬
    </button>

    <!-- Chat Modal -->
    <div
      v-if="isChatOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-start z-50"
      @click="closeChat"
    >
      <div
        class="bg-white rounded-t-lg shadow-lg w-full max-w-sm mx-4 mb-4 p-4"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Chat</h3>
          <button @click="closeChat" class="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div class="chat-messages h-48 overflow-y-auto mb-4 border rounded p-2">
          <p class="text-gray-500 text-sm">Bienvenue dans le chat !</p>
          <!-- Ici vous pouvez ajouter les messages -->
        </div>
        <div class="flex">
          <input
            v-model="message"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Tapez votre message..."
            class="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="sendMessage"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isChatOpen = ref(false);
const message = ref("");

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

const closeChat = () => {
  isChatOpen.value = false;
};

const sendMessage = () => {
  if (message.value.trim()) {
    // Ici, vous pouvez ajouter la logique pour envoyer le message
    console.log("Message envoyé:", message.value);
    message.value = "";
  }
};
</script>

<style scoped>
.chat-messages {
  max-height: 12rem;
}
</style>
