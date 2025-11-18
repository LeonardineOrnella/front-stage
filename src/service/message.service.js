// src/service/message.service.js
import api from "@/lib/axios";

export const messageService = {
  // Récupérer les messages d'une conversation
  getConversationMessages: (otherUserId) => 
    api.get(`/messages/with/${otherUserId}`),

  // Récupérer la conversation formateur ↔ apprenant (côté formateur)
  getConversationWithLearner: (learnerId) =>
    api.get(`/messages/conversation/${learnerId}`),

  // Envoyer un message à un apprenant
  sendMessage: (data) => 
    api.post("/messages", data),

  // Marquer un message comme lu
  markAsRead: (messageId) => 
    api.put(`/messages/${messageId}/read`),

  // Récupérer tous les messages non lus (tous rôles)
  getUnreadMessages: () => 
    api.get("/messages/unread"),

  // Récupérer tous les messages reçus par l'utilisateur connecté (tous rôles)
  getAllReceivedMessages: () => 
    api.get("/messages/received"),

  // Récupérer la liste des conversations
  getConversations: () => 
    api.get("/messages/conversations"),

  // Supprimer un message
  deleteMessage: (messageId) => 
    api.delete(`/messages/${messageId}`),

  // Récupérer les messages récents
  getRecentMessages: (limit = 10) => 
    api.get(`/messages/recent?limit=${limit}`),

  // Marquer plusieurs messages comme lus
  markMultipleAsRead: (messageIds) => 
    api.put("/messages/mark-read", { messageIds })
};

// Constantes utiles
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file'
};

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};
