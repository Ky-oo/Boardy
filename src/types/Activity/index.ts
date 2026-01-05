import type { User } from "../User/index";
import type { Organisation } from "../Organisation/index";
import type { GuestUser } from "../GuestUser/index";

export type ActivityUser = Pick<
  User,
  "id" | "firstname" | "lastname" | "pseudo" | "email"
> & { role?: User["role"] };

export type ActivityHostType = "organisation" | "user" | "event";

export type Activity = {
  id: number;
  title: string;
  description: string;
  gameId: number | null;
  date: string;
  place_name?: string | null;
  address?: string | null;
  city: string;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  seats: number;
  type: "Festival" | "Bars & Soirées" | "Par des joueurs";
  homeHost: boolean;
  price?: number | null;
  private: boolean;
  hostUserId?: number | null;
  hostOrganisationId?: number | null;
  hostType?: ActivityHostType;
  hostId?: number | null;
  hostUser?: ActivityUser | null;
  hostOrganisation?: Organisation | null;
  guestUsers?: GuestUser[];
  playersId: number[];
  users?: ActivityUser[];
  chatId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ActivityWithHost = Activity & {
  host?: ActivityUser | null;
  organisation?: Organisation | null;
};
