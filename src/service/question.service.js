import axios from '@/lib/axios'; // Assure-toi que axios est bien configuré

// Backend route is mounted at /api/question (singular)
const API_URL = "/question";

export const QuestionService = {
  getAll: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (err) {
      console.error("Erreur lors de la récupération des questions :", err);
      return [];
    }
  },

  create: async (data) => {
    try {
      const res = await axios.post(API_URL, data);
      return res.data;
    } catch (err) {
      console.error("Erreur lors de la création de la question :", err);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, data);
      return res.data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la question :", err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      return res.data;
    } catch (err) {
      console.error("Erreur lors de la suppression de la question :", err);
      throw err;
    }
  }
};
