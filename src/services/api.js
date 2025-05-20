import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5063/api', // Updated to match the actual backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
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

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Fix the redirect to avoid the '/loginlogin' issue
      // Use a proper route that exists in your application (typically home page with login modal)
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
