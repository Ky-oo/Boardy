import type { User } from "../User/index";
import type { Organisation } from "../Organisation/index";

export type Activity = {
  id: number;
  title: string;
  description: string;
  gameId: number[];
  date: string;
  place_name?: string;
  address: string;
  city: string;
  postalCode: number;
  seats: number;
  type: "Festival" | "Bar/Soirée" | "Par des joueurs";
  hostType: "organisation" | "user" | "event";
  hostId: number;
  playersId: number[];
  homeHost: boolean;
  price?: number;
};

// Type enrichi avec les données de l'hôte (User) OU de l'organisation
export type ActivityWithHost = Activity & {
  host?: User;
  organisation?: Organisation;
};
