import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
});

export const submitRegistration = async (payload) => {
  const response = await api.post("/register", payload);
  return response.data.data;
};

export const getApplicantByTelegramId = async (telegramId) => {
  const response = await api.get(`/applicants/telegram/${telegramId}`);
  return response.data.data;
};

export const updateStudentProfile = async (studentId, payload) => {
  const response = await api.patch(`/student/profile/${studentId}`, payload);
  return response.data.data;
};

export default api;
