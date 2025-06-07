import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth, useChat } from '../../context/hooks';
import chatService from '../../services/chatService';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import { toast } from 'react-toastify';
import './ChatPage.scss';

const ChatPage = () => {
  const { user } = useAuth();
  const { conversations, markConversationAsRead } = useChat();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isSearching, setIsSearching] = useState(false);

  const handleUserStatusChange = useCallback((userId, isOnline) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (isOnline) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let cleanup = null;

    const initializeChat = async () => {
      if (!user || !isMounted) return;

      try {
        setLoading(true);

        // Connect to SignalR
        await chatService.connect();

        if (!isMounted) return;

        // Set up event handlers (conversations are handled by ChatContext)
        const removeStatusHandler = chatService.onUserStatusChanged(handleUserStatusChange);

        cleanup = () => {
          removeStatusHandler();
        };

        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (isMounted) {
          toast.error('Không thể kết nối chat. Vui lòng thử lại.');
          setLoading(false);
        }
      }
    };

    if (user) {
      initializeChat();
    }

    return () => {
      isMounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, [user, handleUserStatusChange]);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark as read using ChatContext
    if (conversation.unreadCount > 0) {
      try {
        await chatService.markConversationAsRead(conversation.id);
        markConversationAsRead(conversation.id);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }

    // Join conversation room
    try {
      await chatService.joinConversation(conversation.id);
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  };

  const handleStartNewChat = async (selectedUser) => {
    try {
      const conversation = await chatService.getOrCreateConversation(selectedUser.id);
      
      // Select the conversation (ChatContext will handle adding it to the list)
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast.error('Không thể tạo cuộc trò chuyện mới');
    }
  };

  const handleSearchStateChange = (searching) => {
    setIsSearching(searching);
  };

  if (loading) {
    return (
      <Container className="chat-page">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="chat-page">
      <Row className="h-100">
        <Col md={4} lg={3} className="conversation-sidebar">
          <div className="sidebar-header">
            <h5>Tin nhắn</h5>
          </div>
          
          <div className="sidebar-content">
            <UserSearch 
              onUserSelect={handleStartNewChat}
              alwaysVisible={true}
              onSearchStateChange={handleSearchStateChange}
            />
            {!isSearching && (
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                onlineUsers={onlineUsers}
                className={isSearching ? 'searching' : ''}
              />
            )}
          </div>
        </Col>
        
        <Col md={8} lg={9} className="chat-window-container">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user?.id}
              onlineUsers={onlineUsers}
            />
          ) : (
            <div className="no-conversation-selected">
              <div className="text-center">
                <i className="bi bi-chat-text-fill" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                <h4 className="mt-3 text-muted">Chọn một cuộc trò chuyện</h4>
                <p className="text-muted">Nhấn vào cuộc trò chuyện để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;
