import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import './Message.scss';

const Message = ({ 
  message, 
  isOwn, 
  showAvatar, 
  isFirstInGroup, 
  isLastInGroup, 
  onReply 
}) => {
  const [showTime, setShowTime] = useState(false);

  const formatFullTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleMessageClick = () => {
    setShowTime(!showTime);
  };

  const handleReply = () => {
    onReply(message);
  };

  return (
    <div className={`message ${isOwn ? 'own' : 'other'} ${isFirstInGroup ? 'first' : ''} ${isLastInGroup ? 'last' : ''}`}>
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
        <div className="message-content-wrapper">          {/* Sender name (only for first message in group from other users) */}
          {!isOwn && isFirstInGroup && (
            <div className="sender-name">
              {message.senderName}
            </div>
          )}          {/* Reply reference */}
          {message.replyToContent && (
            <div className="reply-reference">
              <div className="reply-bar"></div>
              <div className="reply-content">
                <div className="reply-text">
                  {message.replyToContent}
                </div>
              </div>
            </div>
          )}

          {/* Message bubble */}
          <div className="message-bubble-container">
            <div 
              className="message-bubble"
              onClick={handleMessageClick}
            >
              <div className="message-text">
                {message.content}
              </div>
              
              {/* Message status for own messages */}
              {isOwn && (
                <div className="message-status">
                  <i className="bi bi-check2-all text-muted"></i>
                </div>
              )}
            </div>

            {/* Message actions dropdown */}
            <div className="message-actions">
              <Dropdown drop="start">
                <Dropdown.Toggle 
                  variant="link" 
                  className="message-menu-btn"
                  size="sm"
                >
                  <i className="bi bi-three-dots"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleReply}>
                    <i className="bi bi-reply me-2"></i>
                    Trả lời
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="bi bi-files me-2"></i>
                    Sao chép
                  </Dropdown.Item>
                  {isOwn && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item className="text-danger">
                        <i className="bi bi-trash me-2"></i>
                        Xóa
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {/* Timestamp */}
          {showTime && (
            <div className="message-time">
              {formatFullTime(message.sentAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
