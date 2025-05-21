// Google login implementation
import { toast } from 'react-toastify';

// Load the Google API
const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.getElementById('google-login')) {
      return resolve();
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-login';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Google Sign-In SDK failed to load'));
    document.body.appendChild(script);
  });
};

// Initialize Google login
const initializeGoogle = () => {
  return new Promise((resolve) => {
    if (!window.google) {
      const checkGoogleInterval = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleInterval);
          resolve(window.google);
        }
      }, 100);
    } else {
      resolve(window.google);
    }
  });
};

// Sign in with Google
export const signInWithGoogle = async (callback) => {
  try {
    await loadGoogleScript();
    const google = await initializeGoogle();
    
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '497964594859-v6deipuqgcdb41m6qsndeqskd8j8a88e.apps.googleusercontent.com',
      scope: 'email profile',
      callback: (response) => {
        if (response.access_token) {
          callback('google', response.access_token);
        } else {
          toast.error('Không thể đăng nhập bằng Google.');
        }
      }
    });
    
    // Prompt for user's consent
    client.requestAccessToken();
  } catch (error) {
    console.error('Google login error:', error);
    toast.error('Không thể kết nối với Google. Vui lòng thử lại sau.');
    throw error;
  }
};

export default { signInWithGoogle };
