import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginRequest = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

// ─── Applicants ───────────────────────────────────────────────────────────────
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

// ─── Payment ──────────────────────────────────────────────────────────────────
export const sendPaymentRequest = async (id) => {
  const response = await api.post(`/applicants/${id}/send-payment-request`);
  return response.data;
};

export const approvePayment = async (id) => {
  const response = await api.post(`/applicants/${id}/approve-payment`);
  return response.data.data;
};

export const rejectPayment = async (id, reason) => {
  const response = await api.post(`/applicants/${id}/reject-payment`, { reason });
  return response.data.data;
};

export const requestFullPayment = async (id, note) => {
  const response = await api.post(`/applicants/${id}/request-full-payment`, { note });
  return response.data;
};

export const getReceipt = async (id) => {
  const response = await api.get(`/applicants/${id}/receipt`);
  return response.data.data;
};

// ─── Applicant Activity ───────────────────────────────────────────────────────
export const getApplicantActivity = async (id) => {
  const response = await api.get(`/applicants/${id}/activity`);
  return response.data.data;
};

// ─── Schedules ────────────────────────────────────────────────────────────────
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

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const getAdminUsers = async () => {
  const response = await api.get("/admin-users");
  return response.data.data;
};

export const createAdminUser = async (payload) => {
  const response = await api.post("/admin-users", payload);
  return response.data.data;
};

export const updateAdminUser = async (id, payload) => {
  const response = await api.patch(`/admin-users/${id}`, payload);
  return response.data.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin-users/${id}`);
  return response.data.data;
};
export const resetAdminPassword = async (id, newPassword) => {
  const response = await api.post(`/admin-users/${id}/reset-password`, { 
    password: newPassword 
  });
  return response.data.data;
};

// ─── System Settings ──────────────────────────────────────────────────────────
export const getSystemSettings = async () => {
  const response = await api.get("/system-settings");
  return response.data.data;
};

export const updateSystemSettings = async (payload) => {
  const response = await api.patch("/system-settings", payload);
  return response.data.data;
};

// ─── Analytics (Super Admin) ──────────────────────────────────────────────────
export const getRevenueStats = async (period) => {
  const response = await api.get("/analytics/revenue", { params: { period } });
  return response.data.data;
};

export const getConversionStats = async () => {
  const response = await api.get("/analytics/conversions");
  return response.data.data;
};

export const getFinancialSummary = async () => {
  const response = await api.get("/analytics/financial-summary");
  return response.data.data;
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = async (params) => {
  const response = await api.get("/audit-logs", { params });
  return response.data;
};

export default api;
