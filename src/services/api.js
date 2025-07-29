import axios from 'axios';

// Debug environment
console.log('Environment check:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
});

// Determine the correct base URL
let baseURL;
if (import.meta.env.VITE_API_BASE_URL) {
  baseURL = import.meta.env.VITE_API_BASE_URL;
} else if (import.meta.env.PROD) {
  // Production fallback
  baseURL = 'https://social-media-app-dmfz.onrender.com';
} else {
  // Development fallback
  baseURL = 'http://localhost:5063';
}

console.log('Using API Base URL:', baseURL);

// Create an Axios instance with default config
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
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
    console.log('Making request to:', config.url, 'Full URL:', config.baseURL + config.url);
    console.log('Current window location:', window.location.origin);
    console.log('Current hostname:', window.location.hostname);
    console.log('Request config:', {
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Check if this is a token expiration case (user was previously logged in)
      // We only want to redirect for expired tokens, not for failed login attempts
      const token = localStorage.getItem('token');
      if (token && !error.config.url.includes('/api/auth/login') && !error.config.url.includes('/api/auth/social-login')) {
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
