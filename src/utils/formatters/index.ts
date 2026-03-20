import type { ParticipationRequestStatus } from "@/types/ParticipationRequest";

export const formatRequestStatus = (status: ParticipationRequestStatus) => {
  if (status === "pending") return "En attente";
  if (status === "approved") return "Acceptee";
  if (status === "rejected") return "Refusee";
  return status;
};

export const formatPaymentStatus = (status?: string | null) => {
  if (!status) return "inconnu";
  if (status === "authorized") return "pre-autorise";
  if (status === "paid") return "paye";
  if (status === "canceled") return "annule";
  if (status === "refunded") return "rembourse";
  return status;
};
