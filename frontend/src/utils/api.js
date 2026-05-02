import axios from 'axios';
import toast from 'react-hot-toast';

// Create base instance for Node.js Backend
export const backendApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor for backend auth
backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

// Create base instance for Python AI Service
export const aiApi = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000, // AI models take longer
});

aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Provide user friendly message for AI failures
    const msg = error.response?.data?.error || 'AI service is temporarily unavailable.';
    toast.error(msg);
    return Promise.reject(error);
  }
);
