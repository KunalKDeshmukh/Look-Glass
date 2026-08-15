import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("lookglass_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response?.data?.error) return err.response.data.error;
  return fallback;
}
