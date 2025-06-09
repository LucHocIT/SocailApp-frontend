import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useChat } from '../../context/hooks';
import chatService from '../../services/chatService';
import { toast } from 'react-toastify';
import { 
  FaComments, 
  FaTimes, 
  FaMinusCircle, 
  FaPaperPlane,
  FaSearch,
  FaUserCircle,
  FaCircle
} from 'react-icons/fa';
import './ChatWidget.scss';

const ChatWidget = () => {
  const { user } = useAuth();
  const { conversations, markConversationAsRead } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConversation && isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeConversation, isOpen, isMinimized]);

  // Initialize chat when widget opens
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !isOpen) return;      try {
        // Connect to SignalR if not already connected
        if (!chatService.getConnectionStatus()) {
          await chatService.connect();
        }

        // Set up event handlers
        const removeStatusHandler = chatService.onUserStatusChanged((userId, isOnline) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (isOnline) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });
        });

        return () => {
          removeStatusHandler();
        };
      } catch (error) {
        console.error('Error initializing chat widget:', error);
        toast.error('Không thể kết nối chat');
      }
    };

    if (isOpen) {
      initializeChat();
    }
  }, [user, isOpen]);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversation) {
        setMessages([]);
        return;
      }

      setLoading(true);
      try {
        const conversationMessages = await chatService.getMessages(activeConversation.id);
        setMessages(conversationMessages || []);
        
        // Mark as read
        if (activeConversation.unreadCount > 0) {
          await chatService.markConversationAsRead(activeConversation.id);
          markConversationAsRead(activeConversation.id);
        }

        // Join conversation room
        await chatService.joinConversation(activeConversation.id);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Không thể tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation, markConversationAsRead]);

  // Handle new messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read if widget is open
        if (isOpen && !isMinimized) {
          chatService.markConversationAsRead(activeConversation.id);
          markConversationAsRead(activeConversation.id);
        }
      }
    };

    const removeMessageHandler = chatService.onMessageReceived(handleNewMessage);
    
    return () => {
      removeMessageHandler();
    };
  }, [activeConversation, isOpen, isMinimized, markConversationAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const message = await chatService.sendMessage(activeConversation.id, messageText);
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
      setNewMessage(messageText); // Restore message if failed
    }
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    setSearchTerm('');
  };

  const handleToggleWidget = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveConversation(null);
    setMessages([]);
    setSearchTerm('');
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm.trim()) return true;
    
    const otherUser = conv.participants?.find(p => p.id !== user?.id);
    const fullName = `${otherUser?.firstName} ${otherUser?.lastName}`.toLowerCase();
    const username = otherUser?.username?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) || 
           username.includes(searchTerm.toLowerCase());
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderConversationItem = (conversation) => {
    const otherUser = conversation.participants?.find(p => p.id !== user?.id);
    const isOnline = onlineUsers.has(otherUser?.id);
    
    return (
      <div
        key={conversation.id}
        className={`chat-widget__conversation-item ${
          activeConversation?.id === conversation.id ? 'active' : ''
        }`}
        onClick={() => handleSelectConversation(conversation)}
      >
        <div className="chat-widget__conversation-avatar">
          {otherUser?.profilePictureUrl ? (
            <img src={otherUser.profilePictureUrl} alt={otherUser.username} />
          ) : (
            <FaUserCircle />
          )}
          {isOnline && <div className="chat-widget__online-indicator" />}
        </div>
        
        <div className="chat-widget__conversation-info">
          <div className="chat-widget__conversation-name">
            {otherUser?.firstName} {otherUser?.lastName}
          </div>
          <div className="chat-widget__conversation-preview">
            {conversation.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
          </div>
        </div>
        
        <div className="chat-widget__conversation-meta">
          {conversation.lastMessage && (
            <div className="chat-widget__conversation-time">
              {formatTime(conversation.lastMessage.createdAt)}
            </div>
          )}
          {conversation.unreadCount > 0 && (
            <div className="chat-widget__unread-badge">
              {conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessage = (message) => {
    const isOwn = message.senderId === user?.id;
    
    return (
      <div
        key={message.id}
        className={`chat-widget__message ${isOwn ? 'own' : 'other'}`}
      >
        <div className="chat-widget__message-content">
          {message.content}
        </div>
        <div className="chat-widget__message-time">
          {formatTime(message.createdAt)}
        </div>
      </div>
    );
  };

  // Get unread count for badge
  const totalUnreadCount = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

  return (
    <>
      {/* Widget Toggle Button */}
      <div className="chat-widget__toggle" onClick={handleToggleWidget}>
        <FaComments />
        {totalUnreadCount > 0 && (
          <div className="chat-widget__toggle-badge">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </div>
        )}
      </div>

      {/* Widget Window */}
      {isOpen && (
        <div className={`chat-widget__window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chat-widget__header">
            <div className="chat-widget__header-title">
              {activeConversation ? (
                <>
                  <button 
                    className="chat-widget__back-btn"
                    onClick={() => setActiveConversation(null)}
                  >
                    ←
                  </button>
                  <span>
                    {activeConversation.participants?.find(p => p.id !== user?.id)?.firstName}{' '}
                    {activeConversation.participants?.find(p => p.id !== user?.id)?.lastName}
                  </span>
                </>
              ) : (
                <span>Tin nhắn</span>
              )}
            </div>
            
            <div className="chat-widget__header-actions">
              <button onClick={handleMinimize}>
                <FaMinusCircle />
              </button>
              <button onClick={handleClose}>
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="chat-widget__content">
              {!activeConversation ? (
                // Conversations List
                <div className="chat-widget__conversations">
                  {/* Search */}
                  <div className="chat-widget__search">
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Tìm kiếm cuộc trò chuyện..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Conversations */}
                  <div className="chat-widget__conversations-list">
                    {filteredConversations.length > 0 ? (
                      filteredConversations.map(renderConversationItem)
                    ) : (
                      <div className="chat-widget__empty">
                        <FaComments />
                        <p>Không có cuộc trò chuyện nào</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Chat Window
                <div className="chat-widget__chat">
                  {/* Messages */}
                  <div className="chat-widget__messages">
                    {loading ? (
                      <div className="chat-widget__loading">
                        <div className="spinner" />
                        <span>Đang tải tin nhắn...</span>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map(renderMessage)
                    ) : (
                      <div className="chat-widget__empty">
                        <FaComments />
                        <p>Chưa có tin nhắn nào</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form className="chat-widget__input-form" onSubmit={handleSendMessage}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      maxLength={500}
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                      <FaPaperPlane />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
