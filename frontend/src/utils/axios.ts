const API_URL = 'http://localhost:5000/api';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically add authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
