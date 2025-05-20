import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

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
  
  const handleBackdropClick = (e) => {
    // Close the modal only when clicking on the backdrop itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      {currentMode === 'login' ? (
        <LoginModal onClose={onClose} onSwitchToRegister={handleSwitchToRegister} />
      ) : (
        <RegisterModal onClose={onClose} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
};

export default AuthModals;
