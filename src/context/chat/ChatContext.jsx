import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks';
import chatService from '../../services/chatService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // Calculate total unread conversations (not messages)
  const calculateUnreadCount = useCallback((conversationList) => {
    const total = conversationList.filter(conv => conv.unreadCount > 0).length;
    setUnreadCount(total);
    return total;
  }, []);

  // Load conversations and calculate unread count
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      const conversationList = response.conversations || [];
      setConversations(conversationList);
      calculateUnreadCount(conversationList);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateUnreadCount]);

  // Update conversation unread count
  const updateConversationUnreadCount = useCallback((conversationId, newUnreadCount) => {
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: newUnreadCount }
          : conv
      );
      calculateUnreadCount(updated);
      return updated;
    });
  }, [calculateUnreadCount]);

  // Mark conversation as read
  const markConversationAsRead = useCallback((conversationId) => {
    updateConversationUnreadCount(conversationId, 0);
  }, [updateConversationUnreadCount]);

  // Handle new message received
  const handleNewMessage = useCallback((message) => {
    if (message.type === 'messageRead') {
      markConversationAsRead(message.conversationId);
      return;
    }

    // Update conversation with new message and increment unread count
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === message.conversationId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        const conversation = { ...updated[existingIndex] };
        
        // Update last message info
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.sentAt;
        
        // Increment unread count for this conversation
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;

        // Move to top
        updated.splice(existingIndex, 1);
        updated.unshift(conversation);
        
        // Recalculate total unread count
        calculateUnreadCount(updated);
        
        return updated;
      }
      
      return prev;
    });
  }, [calculateUnreadCount, markConversationAsRead]);

  // Initialize chat context when user is available
  useEffect(() => {
    if (user) {
      loadConversations();
      
      // Set up SignalR event handlers
      const removeMessageHandler = chatService.onMessageReceived(handleNewMessage);
      
      return () => {
        removeMessageHandler();
      };
    } else {
      // Reset state when user logs out
      setConversations([]);
      setUnreadCount(0);
    }
  }, [user, loadConversations, handleNewMessage]);

  const value = {
    conversations,
    unreadCount,
    loading,
    loadConversations,
    markConversationAsRead,
    updateConversationUnreadCount
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
