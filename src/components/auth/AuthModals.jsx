import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';

// Import styles
import './AuthModals.scss';

const AuthModals = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState(initialMode);
  
  // Update current mode when initialMode prop changes
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;
  
  const handleSwitchToLogin = () => setCurrentMode('login');
  const handleSwitchToRegister = () => setCurrentMode('register');
  const handleSwitchToForgotPassword = () => setCurrentMode('forgotPassword');    const handleBackdropClick = (e) => {
    // Nếu click vào backdrop (bên ngoài modal), hiện thông báo xác nhận trước khi đóng
    if (e.target === e.currentTarget) {
      if (window.confirm('Bạn có chắc muốn đóng cửa sổ này?')) {
        onClose();
      }
    }
  };

  const renderModalContent = () => {
    switch (currentMode) {
      case 'register':
        return <RegisterModal 
                onClose={onClose} 
                onSwitchToLogin={handleSwitchToLogin} 
               />;
      case 'forgotPassword':
        return <ForgotPasswordModal 
                onClose={onClose}
                onSwitchToLogin={handleSwitchToLogin}
               />;
      default: // 'login'
        return <LoginModal 
                onClose={onClose}
                onSwitchToRegister={handleSwitchToRegister}
                onSwitchToForgotPassword={handleSwitchToForgotPassword}
               />;
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay" 
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="auth-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {renderModalContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModals;
