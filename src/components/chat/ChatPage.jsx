import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/hooks';
import chatService from '../../services/chatService';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import { toast } from 'react-toastify';
import './ChatPage.scss';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    }
  };  const handleNewMessage = useCallback((message) => {
    if (message.type === 'messageRead') {
      // Handle message read status - ensure the conversation is updated immediately
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      return;
    }

    // Note: Removed newMessage handler as system notifications are disabled per user request

    // Handle direct message (ReceiveMessage) - for users in the conversation
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === message.conversationId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        const conversation = { ...updated[existingIndex] };
        
        // Update last message info
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.sentAt;
        
        // Update unread count if not current conversation
        // If this is the currently selected conversation, don't increment unread count
        // because the user is actively viewing it and it will be auto-marked as read
        if (selectedConversation?.id !== message.conversationId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        // Move to top
        updated.splice(existingIndex, 1);
        updated.unshift(conversation);
        
        return updated;
      }
      
      return prev;
    });

    // Note: Removed notification toast as per user request
    // if (selectedConversation?.id !== message.conversationId) {
    //   toast.info(`Tin nhắn mới từ ${message.senderName}`);
    // }
  }, [selectedConversation]);
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
  }, []);  const handleConversationUpdated = useCallback((updateData) => {
    setConversations(prev => {
      const index = prev.findIndex(conv => conv.id === updateData.ConversationId);
      if (index !== -1) {
        const updated = [...prev];
        const conversation = { ...updated[index] };
        
        // Update conversation data
        conversation.lastMessage = updateData.LastMessage;
        conversation.lastMessageTime = updateData.LastMessageTime;
        conversation.unreadCount = updateData.UnreadCount;
        
        // Move to top if it's not the currently selected conversation
        if (selectedConversation?.id !== updateData.ConversationId) {
          updated.splice(index, 1);
          updated.unshift(conversation);
        } else {
          updated[index] = conversation;
        }
        
        return updated;
      }
      return prev;
    });
  }, [selectedConversation]);

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

        // Load conversations
        await loadConversations();

        if (!isMounted) return;

        // Set up event handlers
        const removeMessageHandler = chatService.onMessageReceived(handleNewMessage);
        const removeStatusHandler = chatService.onUserStatusChanged(handleUserStatusChange);
        const removeConversationHandler = chatService.onConversationUpdated(handleConversationUpdated);

        cleanup = () => {
          removeMessageHandler();
          removeStatusHandler();
          removeConversationHandler();
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
      // Don't disconnect here as it might be used elsewhere
      // chatService.disconnect();
    };
  }, [user, handleNewMessage, handleUserStatusChange, handleConversationUpdated]);
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark as read (use only SignalR to avoid duplication)
    if (conversation.unreadCount > 0) {
      try {
        await chatService.markConversationAsRead(conversation.id);
        
        // Update local state immediately
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
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
      
      // Add to conversations if new
      setConversations(prev => {
        const exists = prev.find(conv => conv.id === conversation.id);
        if (!exists) {
          return [conversation, ...prev];
        }
        return prev;
      });

      // Select the conversation
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast.error('Không thể tạo cuộc trò chuyện mới');
    }
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
      <Row className="h-100">        <Col md={4} lg={3} className="conversation-sidebar">
          <div className="sidebar-header">
            <h5>Tin nhắn</h5>
          </div>
          
          <UserSearch 
            onUserSelect={handleStartNewChat}
            alwaysVisible={true}
          />
          
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onlineUsers={onlineUsers}
          />
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
                <i className="bi bi-chat-dots-fill text-muted" style={{ fontSize: '4rem' }}></i>
                <h4 className="text-muted mt-3">Chọn một cuộc trò chuyện</h4>
                <p className="text-muted">Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới</p>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;
