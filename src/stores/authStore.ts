import { defineStore } from "pinia";
import type { UserWithoutPassword } from "../types/User/index.ts";
import { post, setAuthToken } from "../utils/api/api.ts";
import { router } from "../router/index.ts";

type Tokens = {
  accessToken: string | null;
};

export const useAuth = defineStore("auth", {
  state: () => ({
    user: null as UserWithoutPassword | null,
    isLogged: false as boolean,
    tokens: { accessToken: null } as Tokens,
  }),
  getters: {
    getUser: (state): UserWithoutPassword | null => state.user,
    checkIfLogged: (state): boolean => state.isLogged,
    getTokens: (state) => state.tokens,
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await post(`/auth/login`, { email, password });
        const { user, token } = response;

        if (!user || !token) {
          throw new Error("Réponse de connexion invalide");
        }

        this.isLogged = true;
        this.user = user;
        this.tokens.accessToken = token;
        setAuthToken(token);
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

    async register(
      firstname: string,
      lastname: string,
      pseudo: string,
      email: string,
      password: string,
      city: string
    ) {
      try {
        const response = await post(`/auth/register`, {
          firstname,
          lastname,
          pseudo,
          email,
          password,
          city,
        });

        const { user, token } = response;
        if (!user || !token) {
          throw new Error("Réponse d'inscription invalide");
        }

        this.isLogged = true;
        this.user = user;
        this.tokens.accessToken = token;
        setAuthToken(token);
        router.push("/");
      } catch (error: unknown) {
        const apiError = {
          message:
            error instanceof Error ? error.message : "Erreur d'inscription",
          status: 400,
        };
        console.error("Erreur lors de l'inscription:", apiError);
        throw new Error(apiError.message);
      }
    },

    logout() {
      this.user = null;
      this.isLogged = false;
      this.tokens = { accessToken: null };
      setAuthToken(null);
      router.push("/");
    },

    hydrateAuth() {
      if (this.tokens?.accessToken) {
        setAuthToken(this.tokens.accessToken);
        this.isLogged = true;
      }
    },
  },
  persist: {
    enabled: true,
    afterRestore: (ctx) => {
      const token = ctx.store.tokens?.accessToken || null;
      setAuthToken(token);
      if (token) {
        ctx.store.isLogged = true;
      }
    },
  },
});
