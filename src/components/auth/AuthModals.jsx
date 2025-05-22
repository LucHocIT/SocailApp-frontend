import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import styles from './AuthModals.module.scss';


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
  };  // Use motion explicitly to satisfy linter
  const MotionDiv = motion.div;
    return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv 
          className={styles.overlay}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >          <MotionDiv 
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ 
              type: "spring", 
              damping: 22, 
              stiffness: 350, 
              mass: 0.8 
            }}
            onClick={e => e.stopPropagation()}
          >
            {renderModalContent()}
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default AuthModals;
