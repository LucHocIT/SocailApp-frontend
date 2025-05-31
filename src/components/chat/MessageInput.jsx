import React, { useState, useRef } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import './MessageInput.scss';

const MessageInput = ({ onSendMessage, disabled, placeholder }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newMessage);
    
    // Set cursor position after emoji
    setTimeout(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length);
      input.focus();
    }, 0);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="message-input">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width="100%"
            height={350}
            searchDisabled
            skinTonesDisabled
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}

      <Form onSubmit={handleSubmit} className="message-form">
        <InputGroup>
          {/* Emoji Button */}
          <Button
            variant="outline-secondary"
            onClick={toggleEmojiPicker}
            className="emoji-btn"
            type="button"
          >
            <i className="bi bi-emoji-smile"></i>
          </Button>

          {/* Message Input */}
          <Form.Control
            ref={inputRef}
            as="textarea"
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || 'Nhập tin nhắn...'}
            disabled={disabled}
            className="message-textarea"
            style={{
              resize: 'none',
              minHeight: '38px',
              maxHeight: '120px'
            }}
          />

          {/* File Upload Button */}
          <Button
            variant="outline-secondary"
            className="file-btn"
            type="button"
            disabled={disabled}
          >
            <i className="bi bi-paperclip"></i>
          </Button>

          {/* Send Button */}
          <Button
            variant="primary"
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-btn"
          >
            <i className="bi bi-send-fill"></i>
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default MessageInput;
