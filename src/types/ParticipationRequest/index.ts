import type { ActivityUser } from "@/types/Activity";

export type ParticipationRequestStatus = "pending" | "approved" | "rejected";

export type ParticipationRequestPayment = {
  id: number;
  status: string;
  amount?: number;
  currency?: string;
};

export type ParticipationRequest = {
  id: number;
  activityId: number;
  userId: number;
  status: ParticipationRequestStatus;
  user?: ActivityUser;
  payment?: ParticipationRequestPayment | null;
};
