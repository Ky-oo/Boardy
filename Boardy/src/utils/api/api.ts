import axios from "axios";

const baseURL = "http://localhost:3000"; // Remplacez par l'URL de base de votre API

const api = axios.create({
  baseURL,
});

export const get = async (route: string, params?: Record<string, any>) => {
  try {
    const response = await api.get(route, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const post = async (
  route: string,
  body: any,
  params?: Record<string, any>
) => {
  try {
    const response = await api.post(route, body, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
