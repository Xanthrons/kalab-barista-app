import axios from "axios";

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` });

// Auth
export const loginRequest = (payload) => api.post("/auth/login", payload).then(r => r.data.data);
export const getCurrentUser = () => api.get("/auth/me").then(r => r.data.data);

// Applicants
export const getApplicantStats = () => api.get("/applicants/stats").then(r => r.data.data);
export const getApplicants = (params) => api.get("/applicants", { params }).then(r => r.data);
export const getApplicantById = (id) => api.get(`/applicants/${id}`).then(r => r.data.data);
export const updateApplicant = (id, payload) => api.patch(`/applicants/${id}`, payload).then(r => r.data.data);
export const setApplicantInterest = (id, interest_status) => api.patch(`/applicants/${id}/set-interest`, { interest_status }).then(r => r.data.data);
export const assignApplicantSchedule = (id, assigned_schedule) => api.patch(`/applicants/${id}/assign-schedule`, { assigned_schedule }).then(r => r.data.data);
export const sendPaymentRequest = (id) => api.post(`/applicants/${id}/send-payment-request`).then(r => r.data);
export const approvePayment = (id) => api.post(`/applicants/${id}/approve-payment`).then(r => r.data.data);
export const rejectPayment = (id, reason) => api.post(`/applicants/${id}/reject-payment`, { reason }).then(r => r.data.data);
export const declineApprovedPayment = (id, reason, reimbursed) => api.post(`/applicants/${id}/decline-approved-payment`, { reason, reimbursed }).then(r => r.data.data);
export const requestFullPayment = (id, note) => api.post(`/applicants/${id}/request-full-payment`, { note }).then(r => r.data);
export const getApplicantActivity = (id) => api.get(`/applicants/${id}/activity`).then(r => r.data.data);
export const getReceipt = (id) => api.get(`/applicants/${id}/receipt`).then(r => r.data.data);

// Schedules
export const getSchedules = () => api.get("/schedules").then(r => r.data.data);
export const createSchedule = (payload) => api.post("/schedules", payload).then(r => r.data.data);
export const updateSchedule = (id, payload) => api.patch(`/schedules/${id}`, payload).then(r => r.data.data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`).then(r => r.data.data);

// Admin Users
export const getAdminUsers = () => api.get("/admin-users").then(r => r.data.data);
export const createAdminUser = (payload) => api.post("/admin-users", payload).then(r => r.data.data);
export const updateAdminUser = (id, payload) => api.patch(`/admin-users/${id}`, payload).then(r => r.data.data);
export const resetAdminPassword = (id, new_password) => api.post(`/admin-users/${id}/reset-password`, { new_password }).then(r => r.data);
export const deleteAdminUser = (id) => api.delete(`/admin-users/${id}`).then(r => r.data);

// Settings
export const getSystemSettings = () => api.get("/system-settings").then(r => r.data.data);
export const updateSystemSettings = (payload) => api.patch("/system-settings", payload).then(r => r.data.data);

// Analytics
export const getFinancialSummary = () => api.get("/analytics/financial-summary").then(r => r.data.data);
export const getRevenueStats = (period) => api.get("/analytics/revenue", { params: { period } }).then(r => r.data.data);
export const getConversionStats = () => api.get("/analytics/conversions").then(r => r.data.data);

// Audit Logs
export const getAuditLogs = (params) => api.get("/audit-logs", { params }).then(r => r.data);

export default api;
