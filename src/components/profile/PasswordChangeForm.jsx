import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../context';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PasswordChangeForm.module.scss';

const PasswordChangeForm = ({ onCancel }) => {
  const { changePassword } = useProfile();
  // Use motion explicitly to satisfy linter
  const MotionDiv = motion.div;
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp!');
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
  return (
    <AnimatePresence>      <MotionDiv 
        className={styles.modalOverlay} 
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <MotionDiv 
          className={styles.passwordForm}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <h2 className={styles.formTitle}>Đổi mật khẩu</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                name="currentPassword" 
                id="currentPassword"
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange}
                required
              />
            </div>            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input 
                type="password" 
                name="newPassword" 
                id="newPassword"
                value={passwordData.newPassword} 
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
              <div className={styles.passwordRequirements}>
                Mật khẩu phải chứa ít nhất 6 ký tự
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                name="confirmPassword" 
                id="confirmPassword"
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton}>
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
