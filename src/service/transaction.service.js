// src/services/transaction.service.js
import api from "@/lib/axios";

export const transactionService = {
  // === GESTION DES TRANSACTIONS ===
  
  // Créer une nouvelle transaction (inscription à une formation)
  createTransaction: (data) => api.post("/transactions", data),
  
  // Obtenir les transactions de l'utilisateur connecté
  getMyTransactions: async () => {
    // D'abord récupérer l'utilisateur connecté
    const userResponse = await api.get("/users/me");
    const userId = userResponse.data.id;
    // Puis récupérer ses transactions
    return api.get(`/transactions/user/${userId}`);
  },
  
  // Obtenir les transactions d'un utilisateur spécifique (par ID)
  getUserTransactions: (userId) => api.get(`/transactions/user/${userId}`),
  
  // Obtenir une transaction par ID
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  
  // Obtenir une transaction par référence
  getTransactionByReference: (reference) => api.get(`/transactions/reference/${reference}`),
  
  // Vérifier si un utilisateur a payé pour une formation
  checkUserPayment: (userId, formationId) => api.get(`/transactions/check-payment/${userId}/${formationId}`),
  
  // === MÉTHODES UTILITAIRES ===
  
  // Générer une nouvelle référence unique
  generateReference: () => api.get("/transactions/generate-reference"),
  
  // === POUR LES ADMINISTRATEURS ===
  
  // Obtenir toutes les transactions (admin/formateur seulement)
  getAllTransactions: () => api.get("/transactions"),
  
  // Mettre à jour le statut d'une transaction (admin seulement)
  updateTransactionStatus: (id, status) => api.put(`/transactions/${id}`, { statut_trans: status }),
  
  // Obtenir les transactions par statut
  getTransactionsByStatus: (status) => api.get(`/transactions/status/${status}`),
  
  // Obtenir les transactions d'une formation
  getFormationTransactions: (formationId) => api.get(`/transactions/formation/${formationId}`),
  
  // === STATISTIQUES ===
  
  // Obtenir les statistiques générales (admin seulement)
  getTransactionStats: () => api.get("/transactions/stats/general"),
  
  // Obtenir les revenus par formation
  getRevenueByFormation: () => api.get("/transactions/stats/revenue-by-formation"),
  
  // Obtenir les revenus mensuels
  getMonthlyRevenue: (year) => api.get(`/transactions/stats/monthly-revenue${year ? `?year=${year}` : ''}`),
  
  // Obtenir les transactions récentes
  getRecentTransactions: (limit = 10) => api.get(`/transactions/recent/list?limit=${limit}`),
  
  // === MÉTHODES DE CONVENANCE ===
  
  // Créer une transaction pour s'inscrire à une formation
  inscriptionFormation: async (formationData) => {
    try {
      // Générer une référence unique
      const refResponse = await api.get("/transactions/generate-reference");
      const reference = refResponse.data.data.reference;
      
      // Créer la transaction
      const transactionData = {
        reference,
        montant: formationData.frais_form,
        methode_paiement: formationData.methode_paiement,
        id: formationData.userId, // ID de l'utilisateur
        id_form: formationData.formationId
      };
      
      return await api.post("/transactions", transactionData);
    } catch (error) {
      throw error;
    }
  },
  
  // Vérifier l'accès à une formation (si l'utilisateur a payé)
  checkFormationAccess: async (formationId, userId = null) => {
    try {
      let endpoint;
      if (userId) {
        endpoint = `/transactions/check-payment/${userId}/${formationId}`;
      } else {
        // Si pas d'userId fourni, on utilise l'utilisateur connecté
        const userResponse = await api.get("/users/me");
        const currentUserId = userResponse.data.id;
        endpoint = `/transactions/check-payment/${currentUserId}/${formationId}`;
      }
      
      const response = await api.get(endpoint);
      return response.data.hasPaid;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'accès:", error);
      return false;
    }
  },

  // Vérification robuste: si la route dédiée échoue, on recoupe avec la liste des transactions utilisateur
  checkFormationAccessRobust: async (formationId, userId = null) => {
    try {
      const primary = await transactionService.checkFormationAccess(formationId, userId);
      if (primary) return true;
    } catch {}
    try {
      let uid = userId;
      if (!uid) {
        const me = await api.get("/users/me");
        uid = me?.data?.id;
      }
      if (!uid) return false;
      const txRes = await api.get(`/transactions/user/${uid}`);
      const list = Array.isArray(txRes?.data?.data) ? txRes.data.data : (Array.isArray(txRes?.data) ? txRes.data : []);
      const fId = Number(formationId);
      const hasPaid = list.some((t) => Number(t.id_form) === fId && String(t.statut_trans) === 'Validee');
      return hasPaid;
    } catch (e) {
      console.error('checkFormationAccessRobust fallback error', e?.message);
      return false;
    }
  },
  
  // Obtenir le statut d'une transaction par référence (pour le suivi)
  trackTransaction: async (reference) => {
    try {
      const response = await api.get(`/transactions/reference/${reference}`);
      return {
        success: true,
        transaction: response.data.data,
        status: response.data.data.statut_trans
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Transaction non trouvée"
      };
    }
  }
};

// === CONSTANTES UTILES ===

export const TRANSACTION_STATUS = {
  EN_ATTENTE: 'En_attente',
  VALIDEE: 'Validee',
  ECHOUEE: 'Echouee',
  ANNULEE: 'Annulee'
};

export const PAYMENT_METHODS = {
  CARTE_BANCAIRE: 'Carte_bancaire',
  VIREMENT: 'Virement',
  MOBILE_MONEY: 'Mobile_money'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CARTE_BANCAIRE]: 'Carte bancaire',
  [PAYMENT_METHODS.VIREMENT]: 'Virement bancaire',
  [PAYMENT_METHODS.MOBILE_MONEY]: 'Mobile Money'
};

export const STATUS_LABELS = {
  [TRANSACTION_STATUS.EN_ATTENTE]: 'En attente',
  [TRANSACTION_STATUS.VALIDEE]: 'Validée',
  [TRANSACTION_STATUS.ECHOUEE]: 'Échouée',
  [TRANSACTION_STATUS.ANNULEE]: 'Annulée'
};

export const STATUS_COLORS = {
  [TRANSACTION_STATUS.EN_ATTENTE]: 'text-yellow-600 bg-yellow-100',
  [TRANSACTION_STATUS.VALIDEE]: 'text-green-600 bg-green-100',
  [TRANSACTION_STATUS.ECHOUEE]: 'text-red-600 bg-red-100',
  [TRANSACTION_STATUS.ANNULEE]: 'text-gray-600 bg-gray-100'
};
