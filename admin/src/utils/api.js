import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const getApplicantStats = async () => {
  const response = await api.get("/applicants/stats");
  return response.data.data;
};

export const getApplicants = async (params = {}) => {
  const response = await api.get("/applicants", { params });
  return response.data;
};

export const getApplicantById = async (id) => {
  const response = await api.get(`/applicants/${id}`);
  return response.data.data;
};

export const updateApplicant = async (id, payload) => {
  const response = await api.patch(`/applicants/${id}`, payload);
  return response.data.data;
};

export const setApplicantInterest = async (id, interest_status) => {
  const response = await api.patch(`/applicants/${id}/set-interest`, {
    interest_status
  });
  return response.data.data;
};

export const assignApplicantSchedule = async (id, assigned_schedule) => {
  const response = await api.patch(`/applicants/${id}/assign-schedule`, {
    assigned_schedule
  });
  return response.data.data;
};

export const sendPaymentRequest = async (id) => {
  const response = await api.post(`/applicants/${id}/send-payment-request`);
  return response.data;
};

export const approvePayment = async (id) => {
  const response = await api.post(`/applicants/${id}/approve-payment`);
  return response.data.data;
};

export const getSchedules = async () => {
  const response = await api.get("/schedules");
  return response.data.data;
};

export const createSchedule = async (payload) => {
  const response = await api.post("/schedules", payload);
  return response.data.data;
};

export const updateSchedule = async (id, payload) => {
  const response = await api.patch(`/schedules/${id}`, payload);
  return response.data.data;
};

export const deleteSchedule = async (id) => {
  const response = await api.delete(`/schedules/${id}`);
  return response.data.data;
};

export default api;
