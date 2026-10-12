import api from "./api";

export const createPaymentOrder = async () => {
  const response = await api.post("/student/payments/create-order");
  return response.data;
};

export const verifyPayment = async (paymentDetails) => {
  const response = await api.post(
    "/student/payments/verify",
    paymentDetails
  );

  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get("/student/payments/my-payments");
  return response.data;
};