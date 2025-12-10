import { defineStore } from "pinia";
import type { User, UserWithoutPassword } from "../types/User";
import { get } from "../utils/api/api.ts";
import { useRouter } from "vue-router";

const router = useRouter();

export const useAuth = defineStore("auth", {
  state: () => ({
    user: null as UserWithoutPassword | null,
    isLogged: false as boolean,
    tokens: null as { access_token?: string; refresh_token?: string } | null,
  }),
  getters: {
    getUser: (state): UserWithoutPassword | null => state.user,
    checkIfLogged: (state): boolean => state.isLogged,
    getTokens: (state) => state.tokens,
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await get(`/users`);

        const user: User = response.data.find(
          (u: any) => u.email === email && u.password === password
        );
        if (!user) {
          throw new Error("Email ou mot de passe incorrect.");
        }

        this.isLogged = true;
        const { password: userPassword, ...userWithoutPassword } = user;
        this.user = userWithoutPassword;

        router.push("/");
      } catch (error: unknown) {
        const apiError = {
          message:
            error instanceof Error ? error.message : "Erreur de connexion",
          status: 401,
        };
        console.error("Erreur lors de la connexion:", apiError);
        throw new Error(apiError.message);
      }
    },

    logout() {
      this.user = null;
      this.isLogged = false;
      this.tokens = null;
      router.push("/");
    },
  },
});
