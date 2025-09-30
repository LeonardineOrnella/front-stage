import axios from '@/lib/axios';

// NOTE: Backend mounts routes at /api/reponse (singular)
const API_URL = '/reponse';

export const getReponsesByQuestion = async (questionId) => {
  // If the backend has a route, else filter on client
  const res = await axios.get(`${API_URL}?id_quest=${questionId}`);
  return res.data;
};

export const createReponse = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const deleteReponse = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

export const updateReponse = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};


