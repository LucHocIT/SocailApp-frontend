import React, { useState, useRef, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { 
  FaAt, 
  FaHashtag, 
  FaRegSmile, 
  FaMapMarkerAlt, 
  FaTimes,
  FaLock,
  FaGlobe,
  FaUserSecret
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import styles from '../styles/EditPostModal.module.scss';

const EditPostControls = ({ 
  content, 
  setContent, 
  location, 
  setLocation, 
  privacyLevel, 
  setPrivacyLevel, 
  isSubmitting, 
  textareaRef 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const emojiButtonRef = useRef(null);

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

  const insertTextAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      const newCursorPos = start + textToInsert.length;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  const handleEmojiClick = (emojiData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setContent(before + emojiData.emoji + after);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiData.emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const toggleEmojiPicker = () => {
    if (!showEmojiPicker && emojiButtonRef.current) {
      const buttonRect = emojiButtonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Calculate position for emoji picker
      let top = buttonRect.bottom + 10;
      let left = buttonRect.left;
      
      // Adjust if picker would go outside viewport
      const pickerWidth = 300;
      const pickerHeight = 400;
      
      if (left + pickerWidth > windowWidth) {
        left = windowWidth - pickerWidth - 10;
      }
      
      if (top + pickerHeight > windowHeight) {
        top = buttonRect.top - pickerHeight - 10;
      }
      
      setEmojiPickerPosition({ top, left });
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

  const insertMention = () => {
    insertTextAtCursor('@');
  };

  const insertHashtag = () => {
    insertTextAtCursor('#');
  };

  const removeLocation = () => {
    setLocation('');
  };

  const getCurrentLocation = async () => {
    if (isGettingLocation) return;
    
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use a geocoding service to get location name
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`
        );
        const data = await response.json();
        
        const locationName = data.locality || data.city || data.principalSubdivision || 
                           `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(locationName);
        toast.success('Đã thêm vị trí hiện tại');
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        toast.success('Đã thêm tọa độ vị trí');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      toast.error('Không thể lấy vị trí hiện tại');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <>
      {/* Content tools */}
      <div className={styles.contentTools}>
        <Button
          variant="link"
          className={styles.toolButton}
          onClick={insertMention}
          type="button"
          disabled={isSubmitting}
        >
          <FaAt />
        </Button>
        <Button
          variant="link"
          className={styles.toolButton}
          onClick={insertHashtag}
          type="button"
          disabled={isSubmitting}
        >
          <FaHashtag />
        </Button>
        <Button
          variant="link"
          className={styles.toolButton}
          onClick={toggleEmojiPicker}
          type="button"
          disabled={isSubmitting}
          ref={emojiButtonRef}
        >
          <FaRegSmile />
        </Button>
        <Button
          variant="link"
          className={styles.toolButton}
          onClick={getCurrentLocation}
          disabled={isSubmitting || isGettingLocation}
          type="button"
        >
          <FaMapMarkerAlt />
        </Button>
      </div>

      {/* Emoji picker - positioned absolutely */}
      {showEmojiPicker && (
        <div 
          className={styles.emojiPickerContainer}
          style={{
            position: 'fixed',
            top: `${emojiPickerPosition.top}px`,
            left: `${emojiPickerPosition.left}px`,
            zIndex: 9999
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
          />
        </div>
      )}

      {/* Location display */}
      {location && (
        <div className={styles.locationContainer}>
          <div className={styles.locationDisplay}>
            <FaMapMarkerAlt className={styles.locationIcon} />
            <span className={styles.locationText}>{location}</span>
            <Button
              variant="light"
              size="sm"
              className={styles.removeLocationBtn}
              onClick={removeLocation}
              type="button"
            >
              <FaTimes />
            </Button>
          </div>
        </div>
      )}

      {/* Privacy Section */}
      <div className={styles.privacySection}>
        <h6>Quyền riêng tư</h6>
        <div className={styles.privacyButtons}>
          <Button
            variant={privacyLevel === 0 ? 'primary' : 'light'}
            className={`${styles.privacyButton} ${styles.publicButton}`}
            onClick={() => setPrivacyLevel(0)}
            disabled={isSubmitting}
            type="button"
          >
            <FaGlobe className={styles.privacyIcon} />
            Công khai
          </Button>
          <Button
            variant={privacyLevel === 1 ? 'primary' : 'light'}
            className={`${styles.privacyButton} ${styles.privateButton}`}
            onClick={() => setPrivacyLevel(1)}
            disabled={isSubmitting}
            type="button"
          >
            <FaLock className={styles.privacyIcon} />
            Riêng tư
          </Button>
          <Button
            variant={privacyLevel === 2 ? 'primary' : 'light'}
            className={`${styles.privacyButton} ${styles.secretButton}`}
            onClick={() => setPrivacyLevel(2)}
            disabled={isSubmitting}
            type="button"
          >
            <FaUserSecret className={styles.privacyIcon} />
            Bí mật
          </Button>
        </div>
      </div>
    </>
  );
};

export default EditPostControls;
