// filepath: e:\SocialApp\frontend\src\components\shared\EmojiPicker.jsx
import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import { FaRegSmile } from 'react-icons/fa';
import { useEmojiPicker } from '../../hooks/useEmojiPicker';
import styles from './EmojiPicker.module.scss';

const EmojiPickerComponent = ({ onEmojiClick, disabled = false, buttonClassName = '' }) => {
  const { showPicker, pickerRef, buttonRef, togglePicker, closePicker } = useEmojiPicker();

  const handleEmojiClick = (emojiData) => {
    if (onEmojiClick) {
      onEmojiClick(emojiData.emoji);
    }
    closePicker();
  };

  const handleTogglePicker = () => {
    if (!disabled) {
      togglePicker();
    }
  };

  return (
    <div className={styles.emojiPickerContainer}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.emojiButton} ${buttonClassName} ${disabled ? styles.disabled : ''}`}
        onClick={handleTogglePicker}
        disabled={disabled}
        title="Chọn emoji"
        aria-label="Chọn emoji"
        aria-expanded={showPicker}
        aria-haspopup="true"
      >
        <FaRegSmile />
      </button>
      
      {showPicker && (
        <div ref={pickerRef} className={styles.pickerWrapper}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme="light"
            height={350}
            width={300}
            previewConfig={{
              showPreview: false
            }}
            searchPlaceHolder="Tìm kiếm emoji..."
            skinTonePickerLocation="PREVIEW"
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;