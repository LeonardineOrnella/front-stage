import api from '@/lib/axios';

export const progressionService = {
  getMy: () => api.get('/progressions/me'),
  getMyFormation: (formationId) => api.get(`/progressions/me/${formationId}`),
  upsertMyFormation: (formationId, payload) => api.post(`/progressions/me/${formationId}`, payload),
  // Admin/Formateur endpoints to inspect a learner's progress
  getByUser: (userId) => api.get(`/progressions/user/${userId}`),
  getGlobalByUser: (userId) => api.get(`/progressions/user/${userId}/global`),
  getByUserFormation: (userId, formationId) => api.get(`/progressions/user/${userId}/${formationId}`),
  upsertByUserFormation: (userId, formationId, payload) => api.post(`/progressions/user/${userId}/${formationId}`, payload)
};


