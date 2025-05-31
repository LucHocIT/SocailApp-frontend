import React from 'react';
import { ListGroup } from 'react-bootstrap';
import './ConversationList.scss';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  onlineUsers
}) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };  const getOtherUser = (conversation) => {
    return {
      id: conversation.otherUserId,
      name: conversation.otherUserName,
      avatar: conversation.otherUserAvatar,
      isOnline: conversation.isOtherUserOnline,
      lastActive: conversation.otherUserLastActive
    };
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';
    
    const maxLength = 50;
    const message = conversation.lastMessage;
    
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    
    return message;
  };

  if (conversations.length === 0) {
    return (
      <div className="empty-conversations">
        <div className="text-center p-4">
          <i className="bi bi-chat-text text-muted" style={{ fontSize: '2rem' }}></i>
          <p className="text-muted mt-2">Chưa có cuộc trò chuyện nào</p>
          <p className="text-muted small">Nhấn nút + để bắt đầu trò chuyện mới</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <ListGroup variant="flush">        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          // Sử dụng trạng thái realtime từ SignalR hoặc fallback từ backend
          const isOnline = onlineUsers.has(otherUser.id) || conversation.isOtherUserOnline;
          const isSelected = selectedConversation?.id === conversation.id;
          const hasUnread = conversation.unreadCount > 0;

          return (
            <ListGroup.Item
              key={conversation.id}
              className={`conversation-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-content">                <div className="user-avatar">
                  <img
                    src={otherUser.avatar || '/default-avatar.png'}
                    alt={otherUser.name}
                    className="avatar-img"
                  />
                  {isOnline && <div className="online-indicator"></div>}
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="user-name">
                      {otherUser.name}
                    </span>
                    {conversation.lastMessageTime && (
                      <span className="last-message-time">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    )}
                  </div>
                    <div className="last-message-row">
                    <div className="last-message">
                      {getLastMessagePreview(conversation)}
                    </div>
                    
                    {hasUnread && (
                      <div className="unread-badge">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default ConversationList;
