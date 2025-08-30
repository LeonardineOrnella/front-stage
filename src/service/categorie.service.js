// src/services/user.service.js
import axios from '../lib/axios';

export const categorieService = {
    // Récupérer toutes les catégories
    getAllCategories: async () => {
        try {
            const response = await axios.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw error;
        }
    },

    // Récupérer une catégorie par ID
    getCategorieById: async (id) => {
        try {
            const response = await axios.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la catégorie:', error);
            throw error;
        }
    },

    // Créer une nouvelle catégorie
    createCategorie: async (data) => {
        try {
            const response = await axios.post('/categories', data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la catégorie:', error);
            throw error;
        }
    },

    // Mettre à jour une catégorie
    updateCategorie: async (id, data) => {
        try {
            const response = await axios.put(`/categories/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la catégorie:', error);
            throw error;
        }
    },

    // Supprimer une catégorie
    deleteCategorie: async (id) => {
        try {
            const response = await axios.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de la catégorie:', error);
            throw error;
        }
    },

    // Méthode legacy pour compatibilité
    getcategorie: async () => {
        try {
            const response = await axios.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw error;
        }
    }
};
  