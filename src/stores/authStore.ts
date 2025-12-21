import { defineStore } from "pinia";
import type { UserWithoutPassword } from "../types/User/index.ts";
import { post, put, setAuthToken } from "../utils/api/api.ts";
import { router } from "../router/index.ts";
import { useToastStore } from "./toastStore";

type Tokens = {
  accessToken: string | null;
};

interface AuthState {
  user: UserWithoutPassword | null;
  isLogged: boolean;
  tokens: Tokens;
}

interface LoginResponse {
  user: UserWithoutPassword;
  token: string;
}

interface RegisterResponse {
  user: UserWithoutPassword;
  token: string;
}

export const useAuth = defineStore("auth", {
  state: (): AuthState => ({
    user: null as UserWithoutPassword | null,
    isLogged: false as boolean,
    tokens: { accessToken: null } as Tokens,
  }),
  getters: {
    getUser: (state): UserWithoutPassword | null => state.user,
    checkIfLogged: (state): boolean => state.isLogged,
    getTokens: (state): Tokens => state.tokens,
  },
  actions: {
    async login(email: string, password: string): Promise<void> {
      try {
        const response: LoginResponse = await post(`/auth/login`, {
          email,
          password,
        });
        const { user, token } = response;

        if (!user || !token) {
          throw new Error("Réponse de connexion invalide");
        }

        this.isLogged = true;
        this.user = user;
        this.tokens.accessToken = token;
        setAuthToken(token);
        const toastStore = useToastStore();
        toastStore.addToast("Vous êtes connecté.", { type: "success" });
        router.push("/");
      } catch (error: unknown) {
        console.log(error);
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
    ): Promise<void> {
      try {
        const response: RegisterResponse = await post(`/auth/register`, {
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
        const toastStore = useToastStore();
        toastStore.addToast("Inscription réussie. Bienvenue !", {
          type: "success",
        });
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

    logout(): void {
      this.user = null;
      this.isLogged = false;
      this.tokens = { accessToken: null };
      setAuthToken(null);
      const toastStore = useToastStore();
      toastStore.addToast("Vous êtes déconnecté.", { type: "warning" });
      router.push("/");
    },

    async updateProfile(
      payload: Partial<UserWithoutPassword>
    ): Promise<UserWithoutPassword> {
      if (!this.user) {
        throw new Error("Utilisateur non charge.");
      }
      const updated = await put(`/user/${this.user.id}`, payload);
      this.user = updated;
      const toastStore = useToastStore();
      toastStore.addToast("Profil mis a jour.", { type: "success" });
      return updated;
    },

    hydrateAuth(): void {
      if (this.tokens?.accessToken) {
        setAuthToken(this.tokens.accessToken);
        this.isLogged = true;
      }
    },

    initFromPersisted(): void {
      if (this.tokens?.accessToken) {
        setAuthToken(this.tokens.accessToken);
        this.isLogged = true;
      }
    },
  },
  persist: true,
});
