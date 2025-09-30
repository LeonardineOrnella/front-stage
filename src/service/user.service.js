// src/services/user.service.js
import api from "@/lib/axios";

export const userService = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  getMe: () => api.get("/users/me"),
  updateMe: (formData) => api.put("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  changePassword: (data) => api.put("/users/me/password", data),
  // Enrôler un apprenant à une formation (backend à implémenter)
  inscrireFormation: (payload) => api.post("/inscriptions", payload),
  // Récupérer les cours d'un apprenant (optionnel)
  getMesCours: (userId) => api.get(`/apprenants/${userId}/formations`),
};
