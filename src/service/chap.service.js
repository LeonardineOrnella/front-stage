import axios from "../lib/axios";

export const chapService = {
  getByFormation: async (id_form) => {
    const res = await axios.get(`/chapitres/formation/${id_form}`);
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  },
  getByCategorie: async (id_categ) => {
    const res = await axios.get(`/chapitres/categorie/${id_categ}`);
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  },
  create: async (payload) => {
    const res = await axios.post(`/chapitres`, payload);
    return res?.data;
  },
  update: async (id_chap, payload) => {
    const res = await axios.put(`/chapitres/${id_chap}`, payload);
    return res?.data;
  },
  remove: async (id_chap) => {
    const res = await axios.delete(`/chapitres/${id_chap}`);
    return res?.data;
  },
};


