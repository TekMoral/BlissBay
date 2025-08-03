import axiosInstance from '../lib/axiosInstance';


const BASE_URL = 'http://localhost:5000/api';

const api = axiosInstance.create({
  baseURL: BASE_URL,
  withCredentials: true, // if you're using cookies/session
});

// Add auth token to headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
