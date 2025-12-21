<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToastStore, type ToastType } from "@/stores/toastStore";

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);

const toastClass = (type: ToastType) => {
  switch (type) {
    case "success":
      return "border-green-500";
    case "error":
      return "border-custom-red";
    case "warning":
      return "border-custom-red";
    default:
      return "border-custom-blue";
  }
};
</script>

<template>
  <div
    class="fixed bottom-6 right-6 z-50 w-[320px] max-w-[90vw] pointer-events-none"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex flex-col gap-3 items-end"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full h-30 rounded-xl bg-custom-white text-primary shadow-lg border-l-4 px-4 py-3"
        :class="toastClass(toast.type)"
        role="status"
      >
        <div class="flex items-center justify-between gap-3 h-full">
          <p class="text-xl text-font-bold leading-snug">
            {{ toast.message }}
          </p>
          <button
            type="button"
            class="text-gray-400 hover:cursor-pointer hover:text-gray-600 transition-colors"
            aria-label="Fermer"
            @click="toastStore.removeToast(toast.id)"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
