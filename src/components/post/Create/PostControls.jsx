import React, { useState, useRef, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { 
  FaAt, 
  FaHashtag, 
  FaRegSmile, 
  FaMapMarkerAlt, 
  FaTimes 
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import styles from '../styles/CreatePost.module.scss';

const PostControls = ({ 
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

  const insertMention = () => {
    insertTextAtCursor('@');
  };

  const insertHashtag = () => {
    insertTextAtCursor('#');
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
      
      let top = buttonRect.bottom + 10;
      let left = buttonRect.left;
      
      const pickerWidth = 300;
      const pickerHeight = 400;
      
      if (left + pickerWidth > windowWidth) {
        left = windowWidth - pickerWidth - 20;
      }
      
      if (top + pickerHeight > windowHeight) {
        top = buttonRect.top - pickerHeight - 10;
      }
      
      setEmojiPickerPosition({ top, left });
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            const address = data.display_name.split(',').slice(0, 3).join(', ');
            setLocation(address);
            toast.success('Đã xác định vị trí thành công');
          } else {
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Không thể lấy vị trí hiện tại');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const removeLocation = () => {
    setLocation('');
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

      {/* Emoji picker */}
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

      {/* Privacy selector */}
      <div className={styles.privacySelector}>
        <Form.Select
          value={privacyLevel}
          onChange={(e) => setPrivacyLevel(parseInt(e.target.value))}
          disabled={isSubmitting}
          className={styles.privacySelect}
        >
          <option value={0}>
            🌍 Công khai - Mọi người có thể xem
          </option>
          <option value={1}>
            🔒 Riêng tư - Chỉ người theo dõi
          </option>
          <option value={2}>
            🤫 Bí mật - Chỉ mình tôi
          </option>
        </Form.Select>
      </div>
    </>
  );
};

export default PostControls;
