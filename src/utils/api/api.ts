import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL?.toString();

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(async (config) => {
  if (!config.headers?.Authorization) {
    const { useAuthStore } = await import("@/stores/authStore");
    const authStore = useAuthStore();
    const token = authStore.tokens?.accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import("@/stores/authStore");
      const { router } = await import("@/router/index");

      const authStore = useAuthStore();
      authStore.logout();
      if (router.currentRoute.value.name !== "login") {
        router.push("/login");
      }
    }
    return Promise.reject(error);
  },
);

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const get = async (route: string, params?: Record<string, any>) => {
  const response = await api.get(route, { params });
  return response.data;
};

export const post = async (
  route: string,
  body?: any,
  params?: Record<string, any>,
) => {
  const response = await api.post(route, body, { params });
  return response.data;
};

export const put = async (
  route: string,
  body?: any,
  params?: Record<string, any>,
) => {
  const response = await api.put(route, body, { params });
  return response.data;
};

export const del = async (route: string, params?: Record<string, any>) => {
  const response = await api.delete(route, { params });
  return response.data;
};

export default api;
