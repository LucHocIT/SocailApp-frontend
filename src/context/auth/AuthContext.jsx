import { createContext, useState, useEffect } from 'react';
import authService from '../../services/authService';

// Create auth context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from local storage
  useEffect(() => {
    const initAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(username, password);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register with verification code
  const registerWithVerification = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.registerWithVerification(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request verification code
  const requestVerificationCode = async (email) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.requestVerificationCode(email);
    } catch (err) {
      setError(err.message || 'Gửi mã xác thực thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset code
  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.requestPasswordReset(email);
    } catch (err) {
      setError(err.message || 'Gửi mã đặt lại mật khẩu thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify reset code
  const verifyResetCode = async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.verifyResetCode(email, code);
    } catch (err) {
      setError(err.message || 'Xác thực mã đặt lại mật khẩu thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (resetData) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.resetPassword(resetData);
    } catch (err) {
      setError(err.message || 'Đặt lại mật khẩu thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify email code
  const verifyCode = async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.verifyCode(email, code);
    } catch (err) {
      setError(err.message || 'Xác thực mã thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Social login
  const socialLogin = async (provider, accessToken) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.socialLogin(provider, accessToken);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || 'Đăng nhập bằng mạng xã hội thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Context value
  const contextValue = {
    user,
    setUser, // Expose setUser to other contexts
    loading,
    error,
    login,
    register,
    registerWithVerification,
    requestVerificationCode,
    verifyCode,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    socialLogin,
    logout,
    isAuthenticated: !!user,
  };
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
