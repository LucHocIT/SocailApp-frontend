import React, { useState, forwardRef } from 'react';
import { Dropdown, Image } from 'react-bootstrap';
import { FaFile, FaDownload } from 'react-icons/fa';
import MessageReactions from './MessageReactions';
import ReactionButton from '../reaction/ReactionButton';
import LocationMessage from '../location/LocationMessage';
import useMessageReactions from '../../../hooks/useMessageReactions';
import './Message.scss';

const Message = forwardRef(({ 
  message, 
  isOwn, 
  showAvatar, 
  isFirstInGroup, 
  isLastInGroup, 
  onReply,
  onReactionToggle,
  onScrollToMessage,
  onDeleteMessage
}, ref) => {
  const [showTime, setShowTime] = useState(false);
  const { toggleReaction, isLoading } = useMessageReactions();

  const formatFullTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };
  const handleMessageClick = () => {
    setShowTime(!showTime);
  };  const handleReply = () => {
    onReply(message);
  };

  const handleDeleteClick = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    }
  };

  const handleReplyClick = () => {
    if (message.replyToMessageId && onScrollToMessage) {
      onScrollToMessage(message.replyToMessageId);
    }
  };
  const handleReactionSelect = async (reactionType) => {
    // Optimistic update function
    const optimisticUpdate = (msgId, reactType, userId, isRollback = false) => {
      if (onReactionToggle) {
        onReactionToggle(msgId, reactType, userId, isRollback);
      }
    };
    
    try {
      await toggleReaction(message.id, reactionType, optimisticUpdate);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleReactionClick = async (reactionType) => {
    // Optimistic update function  
    const optimisticUpdate = (msgId, reactType, userId, isRollback = false) => {
      if (onReactionToggle) {
        onReactionToggle(msgId, reactType, userId, isRollback);
      }
    };
    
    try {
      await toggleReaction(message.id, reactionType, optimisticUpdate);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }  };

  // Get current user's reaction if any
  const getCurrentUserReaction = () => {
    return message.hasReactedByCurrentUser ? message.currentUserReactionType : null;
  };

  const renderMediaContent = () => {
    // Handle location messages
    if (message.messageType === 'location' || message.LocationData || (message.latitude && message.longitude)) {
      // Kiểm tra xem location message có expired không (1 giờ)
      const isExpired = message.expiresAt && new Date() > new Date(message.expiresAt);
      
      if (isExpired) {
        return (
          <div className="message-media">
            <div className="expired-location-message">
              <i className="bi bi-geo-alt text-muted"></i>
              <span className="text-muted">Vị trí đã hết hạn</span>
            </div>
          </div>        );
      }

      const location = {
        latitude: message.LocationData?.Latitude || message.latitude,
        longitude: message.LocationData?.Longitude || message.longitude,
        address: message.LocationData?.Address || message.address || `Vị trí: ${message.LocationData?.Latitude || message.latitude}, ${message.LocationData?.Longitude || message.longitude}`,
        mapUrl: `https://www.google.com/maps?q=${message.LocationData?.Latitude || message.latitude},${message.LocationData?.Longitude || message.longitude}`
      };

      return (
        <div>
          <LocationMessage location={location} />
          {message.isTemporary && (
            <div className="location-expiry-info">
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                Vị trí tạm thời - hết hạn sau 1 giờ
              </small>
            </div>
          )}
        </div>
      );
    }

    if (!message.mediaUrl) return null;

    const mediaType = message.mediaType || 'file';

    switch (mediaType.toLowerCase()) {
      case 'image':
        return (
          <Image 
            src={message.mediaUrl} 
            alt="Shared image" 
            className="message-image"
            fluid
            onClick={() => window.open(message.mediaUrl, '_blank')}
            style={{ cursor: 'pointer', maxWidth: '300px', maxHeight: '200px', borderRadius: '12px' }}          />
        );
      case 'video':
        return (
          <video 
            controls 
            className="message-video"
            style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '12px' }}
          >
            <source src={message.mediaUrl} type={message.mediaMimeType || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        );
      case 'file':
      default:
        return (
          <div className="message-file">
            <div className="file-info">
              <FaFile className="file-icon" />
              <div className="file-details">
                {message.mediaFilename && (
                  <span className="file-name">
                    {message.mediaFilename}
                  </span>
                )}
                {message.mediaFileSize && (
                  <span className="file-size">
                    {(message.mediaFileSize / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="file-download-btn"
            >
              <FaDownload />
            </a>
          </div>
        );
    }
  };
  return (
    <div 
      ref={ref}
      className={`message ${isOwn ? 'own' : 'other'} ${isFirstInGroup ? 'first' : ''} ${isLastInGroup ? 'last' : ''}`}
      id={`message-${message.id}`}
    >
      <div className="message-row">        {/* Avatar (only for other user's messages) */}
        {!isOwn && (
          <div className="message-avatar">
            {showAvatar ? (
              <img
                src={message.senderAvatar || "/default-avatar.png"}
                alt={message.senderName}
                className="avatar-img"
              />
            ) : (
              <div className="avatar-spacer"></div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="message-content-wrapper">          {/* Sender name removed for cleaner UI */}          {/* Reply reference */}
          {message.replyToContent && (
            <div 
              className="reply-reference"
              onClick={handleReplyClick}
            >
              <div className="reply-content">
                {message.replyToSender && (
                  <div className="reply-sender">
                    {message.replyToSender}
                  </div>
                )}
                <div className="reply-text">
                  {message.replyToContent}
                </div>
              </div>
            </div>
          )}{/* Message bubble */}
          <div className="message-bubble-container">
            {/* Media content (outside bubble) */}
            {(message.messageType === 'location' || message.LocationData || (message.latitude && message.longitude) || message.mediaUrl) && (
              <div className="media-content">
                {renderMediaContent()}
              </div>
            )}            {/* Text bubble (only if there's text content and it's not a media message) */}
            {message.content && !message.mediaUrl && (
              <div 
                className={`message-bubble ${message.isDeleted ? 'deleted' : ''}`}
                onClick={handleMessageClick}
              >
                <div className="message-text">
                  {message.isDeleted ? (
                    <span className="text-muted">
                      <i className="bi bi-trash me-1"></i>
                      {message.content}
                    </span>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            )}{/* Message Reactions */}
            {message.reactionCounts && Object.keys(message.reactionCounts).length > 0 && (
              <MessageReactions
                reactionCounts={message.reactionCounts}
                hasReactedByCurrentUser={message.hasReactedByCurrentUser || false}
                currentUserReactionType={message.currentUserReactionType}
                onReactionClick={handleReactionClick}
                isOwnMessage={isOwn}
              />
            )}{/* Message actions dropdown */}
            <div className="message-actions">
              {/* Reaction Button */}
              <ReactionButton
                onReactionSelect={handleReactionSelect}
                currentReaction={getCurrentUserReaction()}
                disabled={isLoading}
              />

              {/* Reply Button */}
              <button 
                className="message-reply-btn"
                onClick={handleReply}
                title="Trả lời"
              >
                <i className="bi bi-reply"></i>
              </button>

              <Dropdown drop="start">
                <Dropdown.Toggle 
                  variant="link" 
                  className="message-menu-btn"
                  size="sm"
                >
                  <i className="bi bi-three-dots"></i>
                </Dropdown.Toggle>                <Dropdown.Menu>
                  <Dropdown.Item>
                    <i className="bi bi-files me-2"></i>
                    Sao chép
                  </Dropdown.Item>
                  {isOwn && !message.isDeleted && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item className="text-danger" onClick={handleDeleteClick}>
                        <i className="bi bi-trash me-2"></i>
                        Xóa
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>          {/* Timestamp */}
          {showTime && (
            <div className="message-time">
              {formatFullTime(message.sentAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Message;
