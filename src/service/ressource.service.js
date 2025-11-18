import axios from "../lib/axios";

export const ressourceService = {
  listByChapitre: async (id_chap) => {
    const res = await axios.get(`/ressources/chapitre/${id_chap}`);
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  },
  getAll: async () => {
    const res = await axios.get(`/ressources`);
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  },
  create: async ({ id_chap, type, file }) => {
    const form = new FormData();
    form.append("id_chap", String(id_chap));
    form.append("type", type);
    if (file) form.append("ressource", file);
    const res = await axios.post(`/ressources`, form, { headers: { "Content-Type": "multipart/form-data" } });
    return res?.data;
  },
  update: async (id_res, { id_chap, type, file }) => {
    const form = new FormData();
    if (id_chap != null) form.append("id_chap", String(id_chap));
    if (type != null) form.append("type", type);
    if (file) form.append("ressource", file);
    const res = await axios.put(`/ressources/${id_res}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    return res?.data;
  },
  remove: async (id_res) => {
    const res = await axios.delete(`/ressources/${id_res}`);
    return res?.data;
  },
};


