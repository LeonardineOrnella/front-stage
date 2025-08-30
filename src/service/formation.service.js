import axios from '../lib/axios';

export const formationService = {
  // Récupérer toutes les formations
  getAllFormations: async () => {
    try {
      const response = await axios.get('/formations');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des formations:', error);
      throw error;
    }
  },

  // Récupérer une formation par ID
  getFormationById: async (id) => {
    try {
      const response = await axios.get(`/formations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la formation:', error);
      throw error;
    }
  },

  // Créer une nouvelle formation
  createFormation: async (formData) => {
    try {
      // formData est déjà un FormData avec la bonne structure
      const response = await axios.post('/formations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
      throw error;
    }
  },

  // Mettre à jour une formation
  updateFormation: async (id, formData) => {
    try {
      const response = await axios.put(`/formations/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la formation:', error);
      throw error;
    }
  },

  // Supprimer une formation
  deleteFormation: async (id) => {
    try {
      const response = await axios.delete(`/formations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error);
      throw error;
    }
  },

  // Récupérer les catégories pour le formulaire
  getCategories: async () => {
    try {
      const response = await axios.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }
};

