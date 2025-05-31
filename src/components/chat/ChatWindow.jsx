import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import chatService from '../../services/chatService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toast } from 'react-toastify';
import './ChatWindow.scss';

const ChatWindow = ({ conversation, currentUserId, onlineUsers }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async (reset = false) => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const response = await chatService.getConversationMessages(
        conversation.id, 
        currentPage, 
        50
      );

      if (reset) {
        setMessages(response.messages || []);
        setPage(2);
      } else {
        setMessages(prev => [...(response.messages || []), ...prev]);
        setPage(prev => prev + 1);
      }

      setHasMore(response.hasMore || false);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [conversation, page]);
  const handleNewMessage = useCallback((message) => {
    if (message.type === 'messageRead') return;
    
    // Handle both direct ReceiveMessage and NewMessage events
    if (message.conversationId === conversation?.id || 
        (!message.conversationId && message.type !== 'newMessage')) {
      // For direct ReceiveMessage events, add to messages
      setMessages(prev => [...prev, message]);
    }
  }, [conversation]);

  useEffect(() => {
    if (conversation) {
      loadMessages(true);
    }
  }, [conversation, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const removeHandler = chatService.onMessageReceived(handleNewMessage);
    return removeHandler;
  }, [handleNewMessage]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || !conversation) return;

    try {
      // Send via SignalR for real-time delivery
      await chatService.sendSignalRMessage(
        conversation.id, 
        content.trim(), 
        replyToMessage?.id
      );
      
      // Clear reply
      setReplyToMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };  const getOtherUser = () => {
    return {
      id: conversation.otherUserId,
      name: conversation.otherUserName,
      avatar: conversation.otherUserAvatar,
      isOnline: conversation.isOtherUserOnline,
      lastActive: conversation.otherUserLastActive
    };
  };

  const getOfflineTime = (lastActive) => {
    if (!lastActive) return '';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Vừa mới hoạt động';
    if (diffMinutes < 60) return `Hoạt động ${diffMinutes} phút trước`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hoạt động ${diffDays} ngày trước`;
  };

  const handleReplyToMessage = (message) => {
    setReplyToMessage(message);
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  // useEffect để cập nhật trạng thái mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render để cập nhật thời gian offline
      setMessages(prev => [...prev]);
    }, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval);
  }, []);

  if (!conversation) {
    return null;
  }
  const otherUser = getOtherUser();
  const isOnline = onlineUsers.has(otherUser.id) || otherUser.isOnline;

  return (
    <Card className="chat-window h-100">
      {/* Chat Header */}
      <Card.Header className="chat-header">
        <div className="d-flex align-items-center">
          <div className="user-avatar me-3">
            <img
              src={otherUser.avatar || '/default-avatar.png'}
              alt={otherUser.name}
              className="avatar-img"
            />
            {isOnline && <div className="online-indicator"></div>}
          </div>
          
          <div className="user-info flex-grow-1">
            <h6 className="mb-0">{otherUser.name}</h6>
            <small className={`status ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Đang hoạt động' : getOfflineTime(otherUser.lastActive)}
            </small>
          </div>

          <Dropdown>
            <Dropdown.Toggle variant="link" className="text-muted p-0">
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href={`/profile/${otherUser.id}`}>
                <i className="bi bi-person me-2"></i>
                Xem hồ sơ
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger">
                <i className="bi bi-trash me-2"></i>
                Xóa cuộc trò chuyện
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>

      {/* Messages Area */}
      <Card.Body className="messages-container p-0">
        {loading && page === 1 ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
            onReply={handleReplyToMessage}
          />
        )}
        <div ref={messagesEndRef} />
      </Card.Body>

      {/* Reply Preview */}
      {replyToMessage && (
        <div className="reply-preview">
          <div className="reply-content">            <small className="text-muted">
              Đang trả lời {replyToMessage.senderName}:
            </small>
            <div className="reply-message">
              {replyToMessage.content}
            </div>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-muted p-0"
            onClick={cancelReply}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      )}

      {/* Message Input */}
      <Card.Footer className="message-input-container p-0">        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!conversation}
          placeholder={`Nhắn tin cho ${otherUser.name}...`}
        />
      </Card.Footer>
    </Card>
  );
};

export default ChatWindow;
