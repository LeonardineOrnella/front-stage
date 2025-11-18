// src/services/user.service.js
import api from "@/lib/axios";

export const userService = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  getMe: () => api.get("/users/me"),
  updateMe: (formData) => api.put("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  changePassword: (data) => api.put("/users/me/password", data),
  generateReference: async () => {
    const res = await api.get('/transactions/generate-reference');
    return res?.data?.data?.reference;
  },
  // Enrôler un apprenant à une formation via création de transaction
  inscrireFormation: ({ userId, formationId, montant, methode_paiement, reference }) => {
    const body = {
      montant,
      methode_paiement,
      id: Number(userId),
      id_form: Number(formationId),
      ...(reference ? { reference } : {}),
    };
    return api.post("/transactions", body);
  },
  // Récupérer les cours d'un apprenant (optionnel)
  getMesCours: (userId) => api.get(`/apprenants/${userId}/formations`),
};
