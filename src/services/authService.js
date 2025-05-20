import api from './api';

class AuthService {
  // Regular login with username and password
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
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
  }

  // Social login with Google or Facebook
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
    // Ensure we return an Error object that has a message property
    const errorObj = new Error();
    
    if (error.response && error.response.data) {
      // Get error message from server response
      if (typeof error.response.data === 'string') {
        errorObj.message = error.response.data;
      } else if (error.response.data.message) {
        errorObj.message = error.response.data.message;
      } else {
        errorObj.message = 'Đăng nhập thất bại. Kiểm tra thông tin đăng nhập.';
      }
    } else {
      errorObj.message = 'Không thể kết nối với server. Vui lòng thử lại sau.';
    }
    
    return errorObj;
  }
}

export default new AuthService();
