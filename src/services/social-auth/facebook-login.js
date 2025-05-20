// Facebook login implementation
import { toast } from 'react-toastify';

// Load the Facebook SDK
const loadFacebookScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.getElementById('facebook-login')) {
      console.log('Facebook SDK script already exists');
      return resolve();
    }
    
    console.log('Loading Facebook SDK script...');
    // Add the Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.id = 'facebook-login';
    script.async = true;
    script.defer = true;
    script.setAttribute('crossorigin', 'anonymous');
    script.onload = () => {
      console.log('Facebook SDK script loaded successfully');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Facebook SDK failed to load:', error);
      reject(new Error('Facebook SDK failed to load'));
    };
    document.body.appendChild(script);
  });
};

// Initialize Facebook SDK
const initializeFacebook = () => {
  return new Promise((resolve) => {
    if (!window.FB) {
      const checkFBInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkFBInterval);          const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '1223374322737236';
          console.log('Initializing Facebook SDK with App ID:', appId);
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v17.0', // Updated version matching Facebook's documentation
            localStorage: false,
            status: true // Check login status at page load
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
    console.log('Starting Facebook login process...');
    await loadFacebookScript();
    console.log('Facebook script loaded successfully');
    const FB = await initializeFacebook();
    console.log('Facebook SDK initialized successfully');
    
    // Kiểm tra nếu FB.login tồn tại
    if (typeof FB.login !== 'function') {
      console.error('FB.login is not a function');
      throw new Error('Facebook SDK bị chặn bởi trình duyệt của bạn');
    }
    
    console.log('Calling FB.login...');
    FB.login((response) => {
      console.log('Facebook login response:', response);
      if (response && response.status === 'connected' && response.authResponse) {
        // User is logged in and authenticated
        const accessToken = response.authResponse.accessToken;
        console.log('Facebook login successful, token received');
        callback('facebook', accessToken);
      } else {
        // User cancelled login or did not fully authorize
        console.warn('Facebook login was not successful:', response);
        toast.error('Đăng nhập Facebook bị hủy bỏ.');
      }
    }, { 
      scope: 'public_profile,email',
      auth_type: 'rerequest', // Yêu cầu quyền lại nếu người dùng đã từ chối trước đó
      return_scopes: true // Trả về các quyền đã được cấp
    });
  } catch (error) {
    console.error('Facebook login error:', error);
    if (error.message.includes('blocked') || error.message.includes('chặn')) {
      toast.error('Trình duyệt đang chặn Facebook. Vui lòng tắt chế độ chặn theo dõi hoặc sử dụng phương thức đăng nhập khác.');
    } else {
      toast.error('Không thể kết nối với Facebook. Vui lòng thử lại sau.');
    }
    throw error;
  }
};

export default { signInWithFacebook };
