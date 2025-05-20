import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

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
      setError(err.message || 'Đăng nhập thất bại');
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
      setUser(response.user);
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
      setUser(response.user);
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
    loading,
    error,
    login,
    register,
    registerWithVerification,
    requestVerificationCode,
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

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
