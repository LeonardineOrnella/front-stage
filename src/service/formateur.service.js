// src/services/formateur.service.js
import axios from '../lib/axios';

export const formateurService = {
  // Liste des formateurs via la route dédiée
  getAllFormateurs: async () => {
    try {
      const response = await axios.get('/users/formateurs');
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des formateurs:', error);
      // Fallback: retourner une liste vide
      return [];
    }
  },

  getFormateurById: async (id) => {
    const response = await axios.get(`/users/${id}`);
    return response?.data?.data || response?.data;
  },

  createFormateur: async (data) => {
    const payload = { ...data, role: 'formateur' };
    const response = await axios.post('/users', payload);
    return response?.data?.data || response?.data;
  },

  updateFormateur: async (id, data) => {
    const response = await axios.put(`/users/${id}`, data);
    return response?.data?.data || response?.data;
  },

  deleteFormateur: async (id) => {
    const response = await axios.delete(`/users/${id}`);
    return response?.data?.data || response?.data;
  }
};
