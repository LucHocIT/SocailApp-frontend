import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../context';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProfileEditForm.module.scss';

const ProfileEditForm = ({ profile: initialProfile, onCancel, onProfileUpdated }) => {
  // Use motion explicitly to satisfy linter
  const MotionDiv = motion.div;
  
  const { updateProfile } = useProfile();
  const [profile, setProfile] = useState(initialProfile);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Đảm bảo gửi đủ trường bắt buộc theo UpdateProfileDTO ở backend
      const updatedProfile = {
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio
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
  
  return (
    <AnimatePresence>      <MotionDiv 
        className={styles.modalOverlay}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <MotionDiv 
          className={styles.editForm}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <h2 className={styles.formTitle}>Chỉnh sửa thông tin cá nhân</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">Họ</label>
              <input 
                type="text" 
                name="firstName" 
                id="firstName"
                value={profile.firstName} 
                onChange={handleInputChange}
              />
            </div>            <div className={styles.formGroup}>
              <label htmlFor="lastName">Tên</label>
              <input 
                type="text" 
                name="lastName" 
                id="lastName"
                value={profile.lastName} 
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio">Giới thiệu</label>
              <textarea 
                name="bio" 
                id="bio"
                value={profile.bio} 
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton}>
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
