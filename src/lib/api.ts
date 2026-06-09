import axios from "axios";
import { decrypt } from "./crypto";
import { useAuthStore } from "./authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "string") {
      try {
        const decryptedString = decrypt(response.data);
        if (decryptedString && (decryptedString.startsWith("{") || decryptedString.startsWith("["))) {
          response.data = JSON.parse(decryptedString);
        }
      } catch (err) {
        console.error("API response decryption failed:", err);
      }
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (original.url?.includes('/login')) {
        return Promise.reject(error);
      }
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        let decryptedData = data;
        if (decryptedData && typeof decryptedData === "string") {
          const decryptedString = decrypt(decryptedData);
          decryptedData = JSON.parse(decryptedString);
        }

        localStorage.setItem("accessToken", decryptedData.data.accessToken);
        localStorage.setItem("refreshToken", decryptedData.data.refreshToken);
        original.headers.Authorization = `Bearer ${decryptedData.data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
