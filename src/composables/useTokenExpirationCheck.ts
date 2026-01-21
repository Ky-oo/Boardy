import { onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { isTokenExpired } from "@/utils/tokenExpiration";
import { useRouter } from "vue-router";

export const useTokenExpirationCheck = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const startTokenExpirationCheck = () => {
    intervalId = setInterval(() => {
      if (
        authStore.isLogged &&
        authStore.expiresAt &&
        isTokenExpired(authStore.expiresAt)
      ) {
        authStore.logout();
        router.push("/login");
      }
    }, 30000);
  };

  const stopTokenExpirationCheck = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  onMounted(() => {
    startTokenExpirationCheck();
  });

  onUnmounted(() => {
    stopTokenExpirationCheck();
  });

  return {
    startTokenExpirationCheck,
    stopTokenExpirationCheck,
  };
};
