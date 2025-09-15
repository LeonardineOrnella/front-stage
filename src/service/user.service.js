// src/services/user.service.js
import api from "@/lib/axios";

export const userService = {
  register: (data) => api.post("/register", data),
  
  login: (data) => api.post("/login", data),

  // Gestion des utilisateurs
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  },

  // Méthodes spécifiques aux rôles
  seConnecter: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  seModifier: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}/profile`, userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification du profil:', error);
      throw error;
    }
  },

  seDeconnecter: () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax";
      }
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Méthodes pour les apprenants
  consulterCatalogue: async () => {
    try {
      const response = await api.get('/formations/catalogue');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la consultation du catalogue:', error);
      throw error;
    }
  },

  inscrireFormation: async (userId, formationId) => {
    try {
      const response = await api.post('/inscriptions', {
        userId,
        formationId
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription à la formation:', error);
      throw error;
    }
  },

  suivreFormation: async (userId, formationId) => {
    try {
      const response = await api.get(`/formations/${formationId}/progress/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du suivi de la formation:', error);
      throw error;
    }
  },

  participerQCM: async (userId, qcmId, responses) => {
    try {
      const response = await api.post(`/qcm/${qcmId}/participate`, {
        userId,
        responses
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la participation au QCM:', error);
      throw error;
    }
  },

  telechargerCertificat: async (userId, formationId) => {
    try {
      const response = await api.get(`/certificates/${userId}/${formationId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du certificat:', error);
      throw error;
    }
  },

  // Méthodes pour les formateurs
  gererContenu: async (formateurId) => {
    try {
      const response = await api.get(`/formateurs/${formateurId}/contenus`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion du contenu:', error);
      throw error;
    }
  },

  creerQCM: async (formateurId, qcmData) => {
    try {
      const response = await api.post(`/formateurs/${formateurId}/qcm`, qcmData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du QCM:', error);
      throw error;
    }
  },

  suivreProgression: async (formateurId, formationId) => {
    try {
      const response = await api.get(`/formateurs/${formateurId}/formations/${formationId}/progression`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du suivi de la progression:', error);
      throw error;
    }
  },

  // Méthodes pour les administrateurs
  gererFormation: async () => {
    try {
      const response = await api.get('/admin/formations');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion des formations:', error);
      throw error;
    }
  },

  gererUtilisateur: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion des utilisateurs:', error);
      throw error;
    }
  },

  gererFormateur: async () => {
    try {
      const response = await api.get('/admin/formateurs');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion des formateurs:', error);
      throw error;
    }
  },

  gererCategorie: async () => {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion des catégories:', error);
      throw error;
    }
  },

  gererInscription: async () => {
    try {
      const response = await api.get('/admin/inscriptions');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la gestion des inscriptions:', error);
      throw error;
    }
  },

  superviserTransaction: async () => {
    try {
      const response = await api.get('/admin/transactions');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la supervision des transactions:', error);
      throw error;
    }
  },

  configurerParametre: async (parametres) => {
    try {
      const response = await api.put('/admin/parametres', parametres);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la configuration des paramètres:', error);
      throw error;
    }
  }
};
