// src/services/user.service.js
import api from "@/lib/axios";

export const userService = {
  register: (data) => api.post("/register", data),
  
  login: (data) => api.post("/login", data),
};
