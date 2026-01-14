import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.toString();

const api = axios.create({
  baseURL,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuth } = await import("@/stores/authStore");
      const { router } = await import("@/router/index");

      const authStore = useAuth();
      authStore.logout();
      if (router.currentRoute.value.name !== "login") {
        router.push("/login");
      }
    }
    return Promise.reject(error);
  }
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
  params?: Record<string, any>
) => {
  const response = await api.post(route, body, { params });
  return response.data;
};

export const put = async (
  route: string,
  body?: any,
  params?: Record<string, any>
) => {
  const response = await api.put(route, body, { params });
  return response.data;
};

export const del = async (route: string, params?: Record<string, any>) => {
  const response = await api.delete(route, { params });
  return response.data;
};

export default api;
