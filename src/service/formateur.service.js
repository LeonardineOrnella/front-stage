// src/services/formateur.service.js
import axios from '../lib/axios';

export const formateurService = {
  getAllFormateurs: async () => {
    const response = await axios.get('/formateurs');
    return response.data;
  },

  getFormateurById: async (id) => {
    const response = await axios.get(`/formateurs/${id}`);
    return response.data;
  },

  createFormateur: async (data) => {
    const response = await axios.post('/formateurs', data);
    return response.data;
  },

  updateFormateur: async (id, data) => {
    const response = await axios.put(`/formateurs/${id}`, data);
    return response.data;
  },

  deleteFormateur: async (id) => {
    const response = await axios.delete(`/formateurs/${id}`);
    return response.data;
  }
};
