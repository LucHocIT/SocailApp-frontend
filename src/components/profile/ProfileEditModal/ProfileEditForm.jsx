import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../../context/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaTimes, FaInfoCircle } from 'react-icons/fa';
import styles from './ProfileEditForm.module.scss';

const ProfileEditForm = ({ profile: initialProfile, onCancel, onProfileUpdated }) => {
  const MotionDiv = motion.div;
  const { updateProfile } = useProfile();
  const [profile, setProfile] = useState(initialProfile);
  const [characterCount, setCharacterCount] = useState(initialProfile.bio?.length || 0);
  const maxBioLength = 500;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio' && value.length > maxBioLength) return;
    
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'bio') {
      setCharacterCount(value.length);
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profile.firstName?.trim() || !profile.lastName?.trim()) {
      toast.error('Vui lòng điền đầy đủ họ tên!');
      return;
    }
    
    try {
      const updatedProfile = {
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        bio: profile.bio?.trim()
      };
      
      await updateProfile(updatedProfile);
      toast.success('Cập nhật thông tin thành công!');
      onProfileUpdated({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio
      });
      onCancel();
    } catch (error) {
      toast.error(error.message || 'Cập nhật thông tin thất bại!');
    }
  };
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };
  
  const isFormValid = profile.firstName?.trim() && profile.lastName?.trim();
  
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
          className={styles.editForm}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              <FaUser /> Chỉnh sửa thông tin
            </h2>
            <button 
              className={styles.closeButton} 
              onClick={onCancel}
              aria-label="Đóng"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">Họ</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  name="firstName" 
                  id="firstName"
                  value={profile.firstName} 
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nhập họ của bạn"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Tên</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  name="lastName" 
                  id="lastName"
                  value={profile.lastName} 
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nhập tên của bạn"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio">Giới thiệu</label>
              <div className={styles.textareaWrapper}>
                <textarea 
                  name="bio" 
                  id="bio"
                  value={profile.bio} 
                  onChange={handleInputChange}
                  rows="4"
                  className={styles.textarea}
                  placeholder="Viết một vài điều về bản thân bạn..."
                ></textarea>
                <div className={styles.bioFooter}>
                  <span className={styles.characterCount}>
                    {characterCount}/{maxBioLength}
                  </span>
                  {characterCount > maxBioLength * 0.9 && (
                    <span className={styles.warningText}>
                      <FaInfoCircle /> Sắp đạt giới hạn ký tự
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={!isFormValid}
              >
                Lưu thay đổi
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

export default ProfileEditForm;
