// Facebook login implementation
import { toast } from 'react-toastify';

// Load the Facebook SDK
const loadFacebookScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.getElementById('facebook-login')) {
      return resolve();
    }
    
    // Add the Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.id = 'facebook-login';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Facebook SDK failed to load'));
    document.body.appendChild(script);
  });
};

// Initialize Facebook SDK
const initializeFacebook = () => {
  return new Promise((resolve) => {
    if (!window.FB) {
      const checkFBInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkFBInterval);
          const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '3714037995598635'; // Replace with your actual FB App ID
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v19.0' // Use appropriate API version
          });
          resolve(window.FB);
        }
      }, 100);
    } else {
      resolve(window.FB);
    }
  });
};

// Sign in with Facebook
export const signInWithFacebook = async (callback) => {
  try {
    await loadFacebookScript();
    const FB = await initializeFacebook();
    
    FB.login((response) => {
      if (response.status === 'connected') {
        // User is logged in and authenticated
        const accessToken = response.authResponse.accessToken;
        callback('facebook', accessToken);
      } else {
        // User cancelled login or did not fully authorize
        toast.error('Đăng nhập Facebook bị hủy bỏ.');
      }
    }, { scope: 'public_profile,email' });
  } catch (error) {
    console.error('Facebook login error:', error);
    toast.error('Không thể kết nối với Facebook. Vui lòng thử lại sau.');
    throw error;
  }
};

export default { signInWithFacebook };
