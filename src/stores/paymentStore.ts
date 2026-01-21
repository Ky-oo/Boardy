import { defineStore } from "pinia";
import { post } from "@/utils/api/api";
import { useToastStore } from "@/stores/toastStore";
import type { Activity } from "@/types/Activity";

type CheckoutResponse = {
  url: string;
  sessionId?: string;
};

type PaymentResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const responseMessage = (error as any)?.response?.data?.error;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    checkoutLoading: false,
    confirmLoading: false,
    error: null as string | null,
  }),
  getters: {
    isLoading: (state) => state.checkoutLoading || state.confirmLoading,
  },
  actions: {
    clearError() {
      this.error = null;
    },
    async startCheckout(activityId: number): Promise<PaymentResult<CheckoutResponse>> {
      this.checkoutLoading = true;
      this.error = null;
      try {
        const response = (await post("/payment/checkout", {
          activityId,
        })) as CheckoutResponse;

        if (!response?.url) {
          throw new Error("Impossible de demarrer le paiement.");
        }

        window.location.href = response.url;
        return { ok: true, data: response };
      } catch (error: unknown) {
        const message = getApiErrorMessage(error, "Erreur lors du paiement.");
        this.error = message;
        const toastStore = useToastStore();
        toastStore.addToast(message, { type: "error" });
        return { ok: false, message };
      } finally {
        this.checkoutLoading = false;
      }
    },
    async confirmPayment(
      sessionId: string,
    ): Promise<PaymentResult<Activity | unknown>> {
      this.confirmLoading = true;
      this.error = null;
      try {
        const response = await post("/payment/confirm", { sessionId });
        return { ok: true, data: response as Activity | unknown };
      } catch (error: unknown) {
        const message = getApiErrorMessage(error, "Paiement non confirme.");
        this.error = message;
        const toastStore = useToastStore();
        toastStore.addToast(message, { type: "error" });
        return { ok: false, message };
      } finally {
        this.confirmLoading = false;
      }
    },
  },
});
