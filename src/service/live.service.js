import axios from "../lib/axios";

export const liveService = {
  list: async () => {
    const res = await axios.get('/lives');
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  },
  listByFormation: async (id_form) => {
    const res = await axios.get(`/lives/formation/${id_form}`);
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  },
  get: async (id_live) => {
    const res = await axios.get(`/lives/${id_live}`);
    return res?.data;
  },
  create: async (payload) => {
    const res = await axios.post('/lives', payload);
    return res?.data;
  },
  update: async (id_live, payload) => {
    const res = await axios.put(`/lives/${id_live}`, payload);
    return res?.data;
  },
  remove: async (id_live) => {
    const res = await axios.delete(`/lives/${id_live}`);
    return res?.data;
  }
};


