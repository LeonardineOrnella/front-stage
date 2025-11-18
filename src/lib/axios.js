// src/lib/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercepteur de réponse: si 401/403, déconnecter proprement et rediriger
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {}
      // Invalider le cookie token si présent
      try {
        document.cookie = "token=; Max-Age=0; path=/";
      } catch {}
      // Rediriger vers la connexion
      window.location.href = "/connexion";
    }
    return Promise.reject(error);
  }
);

export default api;
