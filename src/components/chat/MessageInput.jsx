import React, { forwardRef, useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import styles from './MessageInput.module.scss';

const MessageInput = forwardRef(({ 
  value, 
  onChange, 
  onKeyPress, 
  onSend, 
  onEmojiClick,
  showEmojiPicker,
  disabled = false 
}, ref) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle image upload logic here
      console.log('Images selected:', files);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Handle stop recording logic
    } else {
      // Start recording
      setIsRecording(true);
      // Handle start recording logic
    }
  };

  return (
    <div className={styles.messageInput}>
      <InputGroup>
        {/* Attachment buttons */}
        <div className={styles.attachmentButtons}>
          {/* Image upload */}
          <label className={styles.attachmentButton} title="Upload image">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <i className="fas fa-image"></i>
          </label>

          {/* File upload */}
          <label className={styles.attachmentButton} title="Upload file">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <i className="fas fa-paperclip"></i>
          </label>
        </div>

        {/* Text input */}
        <Form.Control
          ref={ref}
          as="textarea"
          rows={1}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          className={styles.textInput}
          style={{
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px'
          }}
        />

        {/* Action buttons */}
        <div className={styles.actionButtons}>
          {/* Emoji picker toggle */}
          <button
            type="button"
            className={`${styles.actionButton} ${showEmojiPicker ? styles.active : ''}`}
            onClick={onEmojiClick}
            title="Add emoji"
          >
            <i className="fas fa-smile"></i>
          </button>

          {/* Voice recording or send button */}
          {value.trim() ? (
            <Button
              variant="primary"
              onClick={onSend}
              disabled={disabled}
              className={styles.sendButton}
              title="Send message"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          ) : (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.voiceButton} ${isRecording ? styles.recording : ''}`}
              onClick={toggleVoiceRecording}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
          )}
        </div>
      </InputGroup>

      {/* Recording indicator */}
      {isRecording && (
        <div className={styles.recordingIndicator}>
          <div className={styles.recordingAnimation}>
            <div className={styles.pulse}></div>
          </div>
          <span>Recording... Tap to stop</span>
        </div>
      )}
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
