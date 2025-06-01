import React, { useState, useRef } from 'react';
import { Form, Button, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import chatService from '../../services/chatService';
import './MessageInput.scss';

const MessageInput = ({ onSendMessage, disabled, placeholder, conversationId, replyToMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversationId) return;

    try {
      setIsUploading(true);
      
      // Determine media type
      let mediaType = 'file';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      }

      // Validate file size
      const maxSize = mediaType === 'video' ? 100 * 1024 * 1024 : 
                     mediaType === 'image' ? 10 * 1024 * 1024 : 
                     25 * 1024 * 1024;
      
      if (file.size > maxSize) {
        toast.error(`File quá lớn. Kích thước tối đa: ${maxSize / (1024 * 1024)}MB`);
        return;
      }      // Upload to server
      const uploadResult = await chatService.uploadChatMedia(file, mediaType);
      
      if (uploadResult.success) {
        // Send media message
        await chatService.sendMediaMessage(conversationId, uploadResult, replyToMessage?.id);
        
        // Trigger message update in parent component if available
        if (onSendMessage) {
          // Signal parent that a new message was sent (for UI updates)
          onSendMessage('📁 ' + (uploadResult.filename || 'File'));
        }
        
        toast.success('Đã gửi file thành công!');
      } else {
        toast.error(uploadResult.message || 'Không thể upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Lỗi khi upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
          />          {/* File Upload Button */}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Đính kèm file</Tooltip>}
          >
            <Button
              variant="outline-secondary"
              className="file-btn"
              type="button"
              disabled={disabled || isUploading}
              onClick={handleFileUpload}
            >
              {isUploading ? (
                <i className="bi bi-hourglass-split"></i>
              ) : (
                <i className="bi bi-paperclip"></i>
              )}
            </Button>
          </OverlayTrigger>

          {/* Send Button */}
          <Button
            variant="primary"
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-btn"
          >
            <i className="bi bi-send-fill"></i>
          </Button>        </InputGroup>
      </Form>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
      />
    </div>
  );
};

export default MessageInput;
