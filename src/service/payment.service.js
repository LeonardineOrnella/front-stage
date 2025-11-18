import api from "@/lib/axios";

export const paymentService = {
  createPaymentIntent: (formationId) =>
    api.post("/payments/intent", { formationId }).then((res) => res.data),
  getConfig: () => api.get("/payments/config").then((res) => res.data),
};

