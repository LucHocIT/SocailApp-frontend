import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../../context/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock, FaTimes, FaCheck } from 'react-icons/fa';
import styles from './PasswordChangeForm.module.scss';

const PasswordChangeForm = ({ onCancel }) => {
  const { changePassword } = useProfile();
  const MotionDiv = motion.div;
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: {
      length: false,
      number: false,
      special: false,
      uppercase: false
    }
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const assessPasswordStrength = (password) => {
    const reqs = {
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password)
    };

    const score = Object.values(reqs).filter(Boolean).length;

    setPasswordStrength({
      score,
      requirements: reqs
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      assessPasswordStrength(value);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp!');
      return;
    }

    if (passwordStrength.score < 2) {
      toast.error('Mật khẩu không đủ mạnh!');
      return;
    }
    
    try {
      await changePassword(passwordData);
      toast.success('Đổi mật khẩu thành công!');
      onCancel();
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Đổi mật khẩu thất bại!');
    }
  };
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getStrengthClass = () => {
    const { score } = passwordStrength;
    if (score === 0) return '';
    if (score === 1) return styles.weak;
    if (score === 2) return styles.medium;
    if (score === 3) return styles.strong;
    return styles.veryStrong;
  };

  return (
    <AnimatePresence>
      <MotionDiv 
        className={styles.modalOverlay} 
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <MotionDiv 
          className={styles.passwordForm}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              <FaLock /> Đổi mật khẩu
            </h2>
            <button 
              className={styles.closeButton} 
              onClick={onCancel}
              aria-label="Đóng"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handlePasswordUpdate}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <div className={styles.passwordInput}>
                <input 
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword" 
                  id="currentPassword"
                  value={passwordData.currentPassword} 
                  onChange={handlePasswordChange}
                  required
                  className={styles.input}
                />
                <button 
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => togglePasswordVisibility('current')}
                  aria-label={showPasswords.current ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className={styles.passwordInput}>
                <input 
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword" 
                  id="newPassword"
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                  className={`${styles.input} ${passwordData.newPassword && getStrengthClass()}`}
                />
                <button 
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => togglePasswordVisibility('new')}
                  aria-label={showPasswords.new ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {passwordData.newPassword && (
                <div className={styles.passwordRequirements}>
                  <div className={`${styles.requirement} ${passwordStrength.requirements.length ? styles.met : ''}`}>
                    <FaCheck /> Ít nhất 8 ký tự
                  </div>
                  <div className={`${styles.requirement} ${passwordStrength.requirements.uppercase ? styles.met : ''}`}>
                    <FaCheck /> Có ít nhất 1 chữ in hoa
                  </div>
                  <div className={`${styles.requirement} ${passwordStrength.requirements.number ? styles.met : ''}`}>
                    <FaCheck /> Có ít nhất 1 số
                  </div>
                  <div className={`${styles.requirement} ${passwordStrength.requirements.special ? styles.met : ''}`}>
                    <FaCheck /> Có ít nhất 1 ký tự đặc biệt
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <div className={styles.passwordInput}>
                <input 
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword" 
                  id="confirmPassword"
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                  className={`${styles.input} ${
                    passwordData.confirmPassword && 
                    (passwordData.confirmPassword === passwordData.newPassword ? styles.match : styles.mismatch)
                  }`}
                />
                <button 
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => togglePasswordVisibility('confirm')}
                  aria-label={showPasswords.confirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                <div className={styles.mismatchMessage}>
                  Mật khẩu xác nhận không khớp
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={!passwordData.currentPassword || 
                         !passwordData.newPassword || 
                         !passwordData.confirmPassword ||
                         passwordStrength.score < 2}
              >
                Đổi mật khẩu
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={onCancel}
              >
                Hủy
              </button>
            </div>
          </form>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default PasswordChangeForm;
