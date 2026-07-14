import axios from 'axios';

const defaultBaseURL = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : `${window.location.origin}/api`;

const baseURL = import.meta.env.VITE_API_URL || defaultBaseURL;
const API = axios.create({
  baseURL,
  timeout: 60000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('geneshield_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('geneshield_token');
      localStorage.removeItem('geneshield_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => API.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) => API.post('/auth/reset-password', { email, otp, newPassword }),
};

export const analysisAPI = {
  analyze: (formData) => API.post('/analysis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  getAll: () => API.get('/analysis'),
  getById: (id) => API.get(`/analysis/${id}`),
  delete: (id) => API.delete(`/analysis/${id}`),
};

export const rsidAPI = {
  search: (q) => API.get(`/rsid/search?q=${encodeURIComponent(q)}`),
  getOne: (rsid) => API.get(`/rsid/${rsid}`),
  listAll: () => API.get('/rsid/all'),
  getAIReport: (rsid, genotype, openaiKey) =>
    API.post('/rsid/ai-report', { rsid, genotype }, {
      headers: openaiKey ? { 'X-OpenAI-Key': openaiKey } : {}
    }),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getAllUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getAllAnalyses: () => API.get('/admin/analyses'),
  deleteAnalysis: (id) => API.delete(`/admin/analyses/${id}`),
};

export default API;
