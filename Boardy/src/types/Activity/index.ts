export type Activity = {
  id: number;
  title: string;
  description: string;
  gameId: number[];
  date: string;
  address: string;
  seats: number;
  type: "organisation" | "user";
  hostId: number;
  playersId: number[];
};
