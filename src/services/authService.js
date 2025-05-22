import api from './api';

class AuthService {  // Regular login with username and password
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // handleError will throw the proper error with message
      throw this.handleError(error);
    }
  }

  // Register a new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Register a user with email verification code
  async registerWithVerification(userData) {
    try {
      const response = await api.post('/auth/verifyAndRegister', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }  // Request verification code to be sent to email
  async requestVerificationCode(email) {
    try {
      const response = await api.post('/auth/sendVerificationCode', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Verify email verification code
  async verifyCode(email, code) {
    try {
      const response = await api.post('/auth/verifyCode', { email, code });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Forgot password - request reset code
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/forgotPassword', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify reset code
  async verifyResetCode(email, code) {
    try {
      const response = await api.post('/auth/verifyResetCode', { email, code });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password
  async resetPassword(resetData) {
    try {
      const response = await api.post('/auth/resetPassword', resetData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }  // Social login with Google or Facebook
  async socialLogin(provider, accessToken) {
    try {
      const response = await api.post('/auth/social-login', {
        provider,
        accessToken
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // handleError will throw the error with proper message
      throw this.handleError(error);
    }
  }

  // Logout - remove token and user from storage
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  }

  // Get current authenticated user
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
  // Helper method to handle errors
  handleError(error) {
    if (error.response) {
      // Server responded with an error status code
      const errorMsg = error.response.data.message || 'Lỗi từ máy chủ';
      // Create and return a proper error with the message from the server
      return new Error(errorMsg);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } else {
      // Something else caused the error
      return new Error(error.message || 'Đã xảy ra lỗi không xác định.');
    }
  }
}

export default new AuthService();
