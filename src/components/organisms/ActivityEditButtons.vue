<template>
  <div class="container mx-auto">
    <div class="relative m-4 sm:m-0">
      <div
        class="w-full flex flex-col sm:flex-row sm:justify-end gap-4 sm:gap-3 sm:mb-6"
      >
        <button
          class="px-4 py-2 bg-custom-green hover:cursor-pointer text-primary rounded-lg hover:bg-custom-green-hover"
          @click="emit('openGuestModal')"
        >
          Ajouter manuellement un utilisateur
        </button>
        <button
          class="px-4 py-2 bg-custom-blue hover:cursor-pointer text-white rounded-lg hover:bg-custom-blue-hover"
          @click="emit('handleEdit')"
        >
          Modifier
        </button>
        <button
          class="hidden sm:inline-block px-4 py-2 bg-red-500 hover:cursor-pointer text-white rounded-lg hover:bg-red-600"
          @click="emit('handleDelete')"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["openGuestModal", "handleEdit", "handleDelete"]);
</script>

<style scoped></style>
