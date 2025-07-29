import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://social-media-app-dmfz.onrender.com', // Use backend URL for production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log the baseURL being used
console.log('API Base URL:', api.defaults.baseURL);
console.log('Environment Variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  PROD: import.meta.env.PROD
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if this is a token expiration case (user was previously logged in)
      // We only want to redirect for expired tokens, not for failed login attempts
      const token = localStorage.getItem('token');
      if (token && !error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/social-login')) {
        // Only for authenticated requests with expired token, not login attempts
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Fix the redirect to avoid the '/loginlogin' issue
        // Use a proper route that exists in your application (typically home page with login modal)
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
