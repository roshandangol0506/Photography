import axios from "axios";
import { cookie } from "@/utils/cookie";

export const TOKEN_COOKIE_KEY = "adminToken";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    apiKey: import.meta.env.VITE_API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const token = cookie.getCookie(TOKEN_COOKIE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
