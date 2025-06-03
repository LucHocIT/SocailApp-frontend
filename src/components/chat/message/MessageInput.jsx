import React, { useState, useRef } from 'react';
import { Form } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import chatService from '../../../services/chatService';
import LocationPicker from '../location/LocationPicker';
import './MessageInput.scss';

const MessageInput = ({ onSendMessage, disabled, placeholder, conversationId, replyToMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper function to get media display text
  const getMediaDisplayText = (mediaType) => {
    switch (mediaType.toLowerCase()) {
      case 'image':
        return '🖼️ Hình ảnh';
      case 'video':
        return '🎥 Video';
      case 'file':
        return '📁 File';
      default:
        return '📁 File';
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
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

  const handleLocationShare = () => {
    setShowLocationPicker(true);
  };  const handleLocationSelect = async (locationData) => {
    try {
      setIsUploading(true);
      
      // Gửi tin nhắn vị trí tạm thời (chỉ qua SignalR, không lưu database)
      await chatService.sendTemporaryLocationMessage(
        conversationId, 
        locationData.latitude, 
        locationData.longitude, 
        locationData.address, 
        replyToMessage?.id
      );
      
      // Trigger message update in parent component
      if (onSendMessage) {
        onSendMessage('📍 Đã chia sẻ vị trí');
      }
      
      setShowLocationPicker(false);
      toast.success('Đã chia sẻ vị trí thành công! (Có hiệu lực trong 1 giờ)');
    } catch (error) {
      console.error('Error sending location:', error);
      toast.error('Không thể chia sẻ vị trí');
    } finally {
      setIsUploading(false);
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
      }

      // Upload to server
      const uploadResult = await chatService.uploadChatMedia(file, mediaType);
      
      if (uploadResult.success) {
        // Send media message
        await chatService.sendMediaMessage(conversationId, uploadResult, replyToMessage?.id);
        
        // Trigger message update in parent component if available
        if (onSendMessage) {
          // Signal parent that a new message was sent (for UI updates)
          onSendMessage(getMediaDisplayText(mediaType));
        }
        
        toast.success(`Đã gửi ${getMediaDisplayText(mediaType).toLowerCase()} thành công!`);
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
      )}      <Form onSubmit={handleSubmit} className="message-form">
        <div className="input-container">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={toggleEmojiPicker}
            className="action-btn emoji-btn"
            disabled={disabled}
          >
            <i className="bi bi-emoji-smile"></i>
          </button>          {/* Message Input */}
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || 'Aa'}
            disabled={disabled}
            className="message-input-field"
            rows={1}
          />          {/* File Upload Button */}
          <button
            type="button"
            className="action-btn file-btn"
            disabled={disabled || isUploading}
            onClick={handleFileUpload}
          >
            {isUploading ? (
              <i className="bi bi-hourglass-split"></i>
            ) : (
              <i className="bi bi-paperclip"></i>
            )}
          </button>

          {/* Location Share Button */}
          <button
            type="button"
            className="action-btn location-btn"
            disabled={disabled || isUploading}
            onClick={handleLocationShare}
            title="Chia sẻ vị trí"
          >
            <i className="bi bi-geo-alt"></i>
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-btn"
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </div>
      </Form>      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
      />

      {/* Location Picker Modal */}
      <LocationPicker
        show={showLocationPicker}
        onHide={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default MessageInput;
