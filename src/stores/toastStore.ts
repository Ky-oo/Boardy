import { defineStore } from "pinia";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
};

const toastTimers = new Map<number, number>();
let nextToastId = 1;

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: [] as Toast[],
  }),
  actions: {
    addToast(
      message: string,
      options?: Partial<Pick<Toast, "type" | "duration">>
    ) {
      const toast: Toast = {
        id: nextToastId++,
        message,
        type: options?.type ?? "info",
        duration: options?.duration ?? 3500,
      };

      this.toasts.push(toast);

      if (toast.duration > 0) {
        const timeoutId = window.setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
        toastTimers.set(toast.id, timeoutId);
      }

      return toast.id;
    },
    removeToast(id: number) {
      const timeoutId = toastTimers.get(id);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        toastTimers.delete(id);
      }
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
    clearToasts() {
      toastTimers.forEach((timeoutId) => window.clearTimeout(timeoutId));
      toastTimers.clear();
      this.toasts = [];
    },
  },
});
