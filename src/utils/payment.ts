import { post } from "@/utils/api/api";
import type { Activity } from "@/types/Activity";

type CheckoutResponse = {
  url: string;
  sessionId?: string;
};

export const createCheckoutSession = async (
  activityId: number
): Promise<CheckoutResponse> => {
  const response = (await post("/payment/checkout", {
    activityId,
  })) as CheckoutResponse;

  if (!response?.url) {
    throw new Error("Impossible de demarrer le paiement.");
  }

  return response;
};

export const confirmPayment = async (
  sessionId: string
): Promise<Activity | unknown> => {
  return post("/payment/confirm", { sessionId });
};
