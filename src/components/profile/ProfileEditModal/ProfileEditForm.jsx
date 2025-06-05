import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../../context/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaTimes, 
  FaInfoCircle, 
  FaUserTag, 
  FaQuoteLeft,
  FaSave,
  FaCheck,
  FaRegSmile 
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import styles from './ProfileEditForm.module.scss';

const ProfileEditForm = ({ profile: initialProfile, onCancel, onProfileUpdated }) => {
  const MotionDiv = motion.div;
  const { updateProfile } = useProfile();
  const [profile, setProfile] = useState(initialProfile);
  const [characterCount, setCharacterCount] = useState(initialProfile.bio?.length || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bioTextareaRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const maxBioLength = 500;

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && 
          emojiButtonRef.current && 
          !emojiButtonRef.current.contains(event.target) &&
          !event.target.closest('.EmojiPickerReact')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio' && value.length > maxBioLength) return;
    
    // Clear field errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'bio') {
      setCharacterCount(value.length);
    }
  };  const handleEmojiClick = (emojiData) => {
    const textarea = bioTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBio = profile.bio.substring(0, start) + emojiData.emoji + profile.bio.substring(end);
    
    // Check if adding emoji would exceed character limit
    if (newBio.length > maxBioLength) {
      toast.warning('Thêm emoji sẽ vượt quá giới hạn ký tự cho phép!');
      return;
    }
    
    setProfile(prev => ({
      ...prev,
      bio: newBio
    }));
    
    setCharacterCount(newBio.length);
    setShowEmojiPicker(false);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiData.emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const getCharacterCountClass = () => {
    const percentage = characterCount / maxBioLength;
    if (percentage >= 0.95) return styles.danger;
    if (percentage >= 0.8) return styles.warning;
    return '';
  };  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate fields
    const errors = {};
    if (!profile.firstName?.trim()) {
      errors.firstName = 'Họ không được để trống';
    }
    if (!profile.lastName?.trim()) {
      errors.lastName = 'Tên không được để trống';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }
    
    setIsSubmitting(true);
    
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
    } finally {
      setIsSubmitting(false);
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

          <form onSubmit={handleProfileUpdate}>            <div className={`${styles.formGroup} ${fieldErrors.firstName ? styles.hasError : ''}`}>
              <label htmlFor="firstName">
                <FaUser className={styles.labelIcon} /> Họ
              </label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  name="firstName" 
                  id="firstName"
                  value={profile.firstName} 
                  onChange={handleInputChange}
                  className={`${styles.input} ${fieldErrors.firstName ? styles.error : ''}`}
                  placeholder="Nhập họ của bạn"
                  required
                />
                <FaUserTag className={styles.inputIcon} />
              </div>
              {fieldErrors.firstName && (
                <span className={styles.errorMessage}>
                  <FaTimes /> {fieldErrors.firstName}
                </span>
              )}
            </div>

            <div className={`${styles.formGroup} ${fieldErrors.lastName ? styles.hasError : ''}`}>
              <label htmlFor="lastName">
                <FaUser className={styles.labelIcon} /> Tên
              </label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  name="lastName" 
                  id="lastName"
                  value={profile.lastName} 
                  onChange={handleInputChange}
                  className={`${styles.input} ${fieldErrors.lastName ? styles.error : ''}`}
                  placeholder="Nhập tên của bạn"
                  required
                />
                <FaUserTag className={styles.inputIcon} />
              </div>
              {fieldErrors.lastName && (
                <span className={styles.errorMessage}>
                  <FaTimes /> {fieldErrors.lastName}
                </span>
              )}
            </div>            <div className={styles.formGroup}>
              <label htmlFor="bio">
                <FaQuoteLeft className={styles.labelIcon} /> Giới thiệu
              </label>
              <div className={styles.textareaWrapper}>
                <textarea 
                  name="bio" 
                  id="bio"
                  value={profile.bio} 
                  onChange={handleInputChange}
                  rows="4"
                  className={styles.textarea}
                  placeholder="Viết một vài điều về bản thân bạn..."
                  ref={bioTextareaRef}
                ></textarea>
                
                <FaInfoCircle className={styles.textareaIcon} />
                
                {/* Emoji button positioned at bottom right outside textarea */}
                <button 
                  type="button" 
                  className={styles.emojiButton}
                  onClick={toggleEmojiPicker}
                  ref={emojiButtonRef}
                  aria-label="Chọn biểu tượng cảm xúc"
                  title="Thêm emoji"
                >
                  <FaRegSmile />
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className={styles.emojiPickerContainer}>
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={300}
                      height={350}
                      theme="light"
                      searchPlaceholder="Tìm emoji..."
                      previewConfig={{
                        showPreview: true,
                        defaultEmoji: "1f60a"
                      }}
                    />                  </div>
                )}
              </div>
              
              {/* Character count section */}
              <div className={styles.bioCounter}>
                <span className={`${styles.characterCount} ${getCharacterCountClass()}`}>
                  {characterCount}/{maxBioLength}
                </span>
                {characterCount > maxBioLength * 0.9 && (
                  <span className={styles.warningText}>
                    <FaInfoCircle /> Sắp đạt giới hạn ký tự
                  </span>
                )}
              </div>
            </div><div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner}></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave className={styles.buttonIcon} />
                    Lưu thay đổi
                  </>
                )}
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <FaTimes className={styles.buttonIcon} />
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
