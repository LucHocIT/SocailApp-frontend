import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';

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
  const handleSwitchToForgotPassword = () => setCurrentMode('forgotPassword');
  
  const handleBackdropClick = (e) => {
    // Close the modal only when clicking on the backdrop itself,
    // and confirm first to prevent accidental closing
    if (e.target === e.currentTarget) {
      // The user clicked outside the modal
      if (currentMode === 'login') {
        onClose();
      } else if (currentMode === 'register' || currentMode === 'forgotPassword') {
        // For registration and forgot password, ask for confirmation since it involves data entry
        if (window.confirm('Bạn có chắc muốn hủy quá trình này?')) {
          onClose();
        }
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
    <div className="modal-overlay" onClick={handleBackdropClick}>
      {renderModalContent()}
    </div>
  );
};

export default AuthModals;
