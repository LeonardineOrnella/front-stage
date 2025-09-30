import api from "@/lib/axios";

const BASE = "/resultat"; // backend route is singular: /api/resultat

export const ResultatService = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
  getNoteByQcm: (id, id_qcm) => api.get(`${BASE}/note/${id}/${id_qcm}`),
};
