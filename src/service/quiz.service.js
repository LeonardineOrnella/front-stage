import axios from '@/lib/axios';

const API_URL = '/qcm';

// Récupérer tous les QCM
export const getQcms = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Créer un nouveau QCM
export const createQcm = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

// Création profonde: QCM + questions + réponses
export const createQcmDeep = async (data) => {
  const res = await axios.post(`${API_URL}/deep`, data);
  return res.data;
};

// Récupérer toutes les questions d'un QCM
export const getQuestionsByQcm = async (qcmId) => {
  const res = await axios.get(`${API_URL}/${qcmId}/questions`);
  return res.data;
};

// Ajouter une question à un QCM existant
export const addQuestionToQcm = async (qcmId, questionId) => {
  // Backend attends POST /:id_qcm/questions/:id_quest
  const res = await axios.post(`${API_URL}/${qcmId}/questions/${questionId}`);
  return res.data;
};

// Supprimer un QCM
export const deleteQcm = async (qcmId) => {
  const res = await axios.delete(`${API_URL}/${qcmId}`);
  return res.data;
};
