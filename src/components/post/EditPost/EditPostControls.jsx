import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, ButtonGroup, Tooltip, OverlayTrigger, Badge } from 'react-bootstrap';
import { 
  FaAt, 
  FaHashtag, 
  FaRegSmile, 
  FaMapMarkerAlt, 
  FaTimes,
  FaLock,
  FaGlobe,
  FaUserSecret,
  FaMapPin
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
    <div className={styles.controlsContainer}>
      {/* Text Formatting Tools */}
      <div className={styles.textToolsSection}>
        <div className={styles.sectionLabel}>
          <span>Công cụ định dạng</span>
        </div>
        <ButtonGroup className={styles.toolButtonGroup}>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Nhắc tới ai đó (@mention)</Tooltip>}
          >
            <Button
              variant="outline-primary"
              className={styles.toolButton}
              onClick={insertMention}
              disabled={isSubmitting}
            >
              <FaAt />
            </Button>
          </OverlayTrigger>
          
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Thêm hashtag (#tag)</Tooltip>}
          >
            <Button
              variant="outline-primary"
              className={styles.toolButton}
              onClick={insertHashtag}
              disabled={isSubmitting}
            >
              <FaHashtag />
            </Button>
          </OverlayTrigger>
          
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Thêm emoji 😊</Tooltip>}
          >
            <Button
              variant="outline-primary"
              className={`${styles.toolButton} ${showEmojiPicker ? styles.active : ''}`}
              onClick={toggleEmojiPicker}
              disabled={isSubmitting}
              ref={emojiButtonRef}
            >
              <FaRegSmile />
            </Button>
          </OverlayTrigger>
          
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Thêm vị trí</Tooltip>}
          >
            <Button
              variant="outline-primary"
              className={styles.toolButton}
              onClick={getCurrentLocation}
              disabled={isSubmitting || isGettingLocation}
            >
              <FaMapMarkerAlt />
              {isGettingLocation && (
                <div className={styles.loadingSpinner}>
                  <div className={styles.spinner}></div>
                </div>
              )}
            </Button>
          </OverlayTrigger>
        </ButtonGroup>
      </div>

      {/* Privacy Settings */}
      <div className={styles.privacySection}>
        <div className={styles.sectionLabel}>
          <FaLock className={styles.sectionIcon} />
          <span>Quyền riêng tư</span>
        </div>
        <ButtonGroup className={styles.privacyButtonGroup}>
          <Button
            variant={privacyLevel === 0 ? 'success' : 'outline-success'}
            className={`${styles.privacyButton} ${styles.publicButton}`}
            onClick={() => setPrivacyLevel(0)}
            disabled={isSubmitting}
          >
            <FaGlobe className={styles.privacyIcon} />
            <span className={styles.privacyText}>Công khai</span>
          </Button>
          
          <Button
            variant={privacyLevel === 1 ? 'warning' : 'outline-warning'}
            className={`${styles.privacyButton} ${styles.privateButton}`}
            onClick={() => setPrivacyLevel(1)}
            disabled={isSubmitting}
          >
            <FaLock className={styles.privacyIcon} />
            <span className={styles.privacyText}>Riêng tư</span>
          </Button>
          
          <Button
            variant={privacyLevel === 2 ? 'danger' : 'outline-danger'}
            className={`${styles.privacyButton} ${styles.secretButton}`}
            onClick={() => setPrivacyLevel(2)}
            disabled={isSubmitting}
          >
            <FaUserSecret className={styles.privacyIcon} />
            <span className={styles.privacyText}>Bí mật</span>
          </Button>
        </ButtonGroup>
      </div>

      {/* Location Display */}
      {location && (
        <div className={styles.locationContainer}>
          <Badge bg="info" className={styles.locationBadge}>
            <FaMapPin className={styles.locationIcon} />
            <span className={styles.locationText}>{location}</span>
            <Button
              variant="link"
              size="sm"
              className={styles.removeLocationButton}
              onClick={removeLocation}
              disabled={isSubmitting}
            >
              <FaTimes />
            </Button>
          </Badge>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div 
          className={styles.emojiPickerOverlay}
          style={{
            position: 'fixed',
            top: `${emojiPickerPosition.top}px`,
            left: `${emojiPickerPosition.left}px`,
            zIndex: 9999
          }}
        >
          <div className={styles.emojiPickerContainer}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={320}
              height={420}
              theme="light"
              searchPlaceholder="Tìm emoji..."
              previewConfig={{
                showPreview: true,
                defaultEmoji: "1f60a"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPostControls;
