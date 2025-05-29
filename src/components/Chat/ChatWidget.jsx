import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaComments, FaTimes, FaMinus, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/hooks';
import { useSignalR } from '../../context/SignalRContext';
import messageService from '../../services/messageService';
import useNotifications from '../../hooks/useNotifications';
import TimeAgo from 'react-timeago';
import styles from './styles/ChatWidget.module.scss';

const ChatWidget = () => {
  const { user } = useAuth();
  const { 
    isConnected, 
    onReceiveMessage, 
    offReceiveMessage,
    sendMessage: sendSignalRMessage 
  } = useSignalR();
  const { showMessageNotification, requestPermission } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const messagesEndRefs = useRef({});

  // Define loadConversations before useEffect
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data.slice(0, 5)); // Show only recent 5
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
      // Request notification permission
      requestPermission();
    }
  }, [user, requestPermission, loadConversations]);

  // SignalR message listener
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      // Update conversations
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.userId === message.senderId 
            ? { 
                ...conv, 
                lastMessage: message.content,
                lastMessageTime: message.sentAt,
                unreadCount: (conv.unreadCount || 0) + 1
              }
            : conv
        );
        
        // If new conversation, add it
        if (!updated.find(conv => conv.userId === message.senderId)) {
          updated.unshift({
            userId: message.senderId,
            userName: message.senderName,
            profilePictureUrl: null,
            lastMessage: message.content,
            lastMessageTime: message.sentAt,
            unreadCount: 1
          });
        }
        
        return updated;
      });

      // Update active chat if open and show notification if needed
      setActiveChats(prev => {
        const chatExists = prev.find(chat => chat.userId === message.senderId);
        
        if (chatExists) {
          // Update existing chat
          return prev.map(chat => 
            chat.userId === message.senderId
              ? { 
                  ...chat, 
                  messages: [...chat.messages, message],
                  unreadCount: (chat.unreadCount || 0) + 1
                }
              : chat
          );
        } else {
          // Show notification for new message when chat is not open
          try {
            showMessageNotification(message);
          } catch (error) {
            console.error('Error showing notification:', error);
          }
          return prev;
        }
      });
    };

    if (onReceiveMessage && offReceiveMessage) {
      onReceiveMessage(handleReceiveMessage);

      return () => {
        offReceiveMessage(handleReceiveMessage);
      };
    }
  }, [onReceiveMessage, offReceiveMessage, showMessageNotification]);

  // Calculate total unread messages
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    setTotalUnread(total);
  }, [conversations]);

  const openChat = async (conversation) => {
    // Check if already open
    if (activeChats.find(chat => chat.userId === conversation.userId)) {
      return;
    }

    try {
      // Load messages
      const messages = await messageService.getMessages(conversation.userId, 1, 20);
      
      const newChat = {
        ...conversation,
        messages: messages,
        newMessage: '',
        isMinimized: false
      };

      setActiveChats(prev => [...prev, newChat]);

      // Mark as read
      await messageService.markConversationAsRead(conversation.userId);
      
      // Update conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === conversation.userId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const closeChat = (userId) => {
    setActiveChats(prev => prev.filter(chat => chat.userId !== userId));
  };

  const minimizeChat = (userId) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.userId === userId 
          ? { ...chat, isMinimized: !chat.isMinimized }
          : chat
      )
    );
  };

  const sendMessage = async (userId, content) => {
    if (!content.trim()) return;

    try {
      // Send via SignalR
      if (isConnected) {
        await sendSignalRMessage(userId, content);
      } else {
        // Fallback to HTTP
        await messageService.sendMessage(userId, content);
      }

      // Clear input
      setActiveChats(prev => 
        prev.map(chat => 
          chat.userId === userId 
            ? { ...chat, newMessage: '' }
            : chat
        )
      );

      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom(userId);
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateMessage = (userId, message) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.userId === userId 
          ? { ...chat, newMessage: message }
          : chat
      )
    );
  };

  const scrollToBottom = (userId) => {
    const element = messagesEndRefs.current[userId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Widget Button */}
      <div className={styles.chatWidget}>
        <Button
          variant="primary"
          className={styles.chatToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaComments />
          {totalUnread > 0 && (
            <Badge bg="danger" className={styles.unreadBadge}>
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>

        {/* Conversations List */}
        {isOpen && (
          <Card className={styles.conversationsList}>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Tin nhắn</h6>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-0"
                >
                  <FaMinus />
                </Button>
              </div>
            </Card.Header>
            
            {!isMinimized && (
              <Card.Body className={styles.conversationsBody}>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-muted text-center">Chưa có cuộc trò chuyện</p>
                ) : (
                  conversations.map(conversation => (
                    <div
                      key={conversation.userId}
                      className={styles.conversationItem}
                      onClick={() => openChat(conversation)}
                    >
                      <img
                        src={conversation.profilePictureUrl || '/images/default-avatar.png'}
                        alt={conversation.userName}
                        className={styles.avatar}
                      />
                      <div className={styles.conversationContent}>
                        <div className={styles.userName}>
                          {conversation.firstName && conversation.lastName 
                            ? `${conversation.firstName} ${conversation.lastName}` 
                            : conversation.userName}
                        </div>
                        <div className={styles.lastMessage}>
                          {conversation.lastMessage}
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge bg="primary" className={styles.conversationBadge}>
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </Card.Body>
            )}
          </Card>
        )}
      </div>

      {/* Active Chat Windows */}
      <div className={styles.activeChats}>
        {activeChats.map(chat => (
          <Card key={chat.userId} className={styles.chatWindow}>
            <Card.Header className={styles.chatHeader}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={chat.profilePictureUrl || '/images/default-avatar.png'}
                    alt={chat.userName}
                    className={styles.chatAvatar}
                  />
                  <span className={styles.chatUserName}>
                    {chat.firstName && chat.lastName 
                      ? `${chat.firstName} ${chat.lastName}` 
                      : chat.userName}
                  </span>
                </div>
                <div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => minimizeChat(chat.userId)}
                    className="p-0 me-2"
                  >
                    <FaMinus />
                  </Button>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => closeChat(chat.userId)}
                    className="p-0"
                  >
                    <FaTimes />
                  </Button>
                </div>
              </div>
            </Card.Header>
            
            {!chat.isMinimized && (
              <>
                <Card.Body className={styles.chatBody}>
                  <div className={styles.messagesContainer}>
                    {chat.messages.map(message => (
                      <div 
                        key={message.id || message.messageId}
                        className={`${styles.message} ${
                          message.senderId === user.id ? styles.sent : styles.received
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {message.content}
                        </div>
                        <div className={styles.messageTime}>
                          <TimeAgo date={message.sentAt} />
                        </div>
                      </div>
                    ))}
                    <div ref={el => messagesEndRefs.current[chat.userId] = el} />
                  </div>
                </Card.Body>
                
                <Card.Footer className={styles.chatFooter}>
                  <Form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(chat.userId, chat.newMessage);
                    }}
                    className="d-flex"
                  >
                    <Form.Control
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={chat.newMessage || ''}
                      onChange={(e) => updateMessage(chat.userId, e.target.value)}
                      className="me-2"
                      size="sm"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!chat.newMessage?.trim() || !isConnected}
                    >
                      <FaPaperPlane />
                    </Button>
                  </Form>
                </Card.Footer>
              </>
            )}
          </Card>
        ))}
      </div>
    </>
  );
};

export default ChatWidget;
