// Types pour l'application
export type User = {
  id: number;
  firstname: string;
  lastname: string;
  pseudo: string;
  password: string;
  city: string;
  email: string;
  role: "user" | "admin";
};

export type UserWithoutPassword = Omit<User, "password">;
