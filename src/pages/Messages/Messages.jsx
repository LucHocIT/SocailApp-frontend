import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Form, Spinner } from 'react-bootstrap';
import { FaSearch, FaPaperPlane, FaCircle } from 'react-icons/fa';
import { useAuth } from '../../context/hooks';
import { useSignalR } from '../../context/SignalRContext';
import { useProfile } from '../../context/hooks';
import messageService from '../../services/messageService';
import { toast } from 'react-toastify';
import TimeAgo from 'react-timeago';
import styles from './styles/Messages.module.scss';

const Messages = () => {
  const { user } = useAuth();
  const { 
    isConnected, 
    onReceiveMessage, 
    offReceiveMessage, 
    onMessageSent, 
    offMessageSent,
    sendMessage: sendSignalRMessage 
  } = useSignalR();
  const { getFollowers, getFollowing } = useProfile();

  // State variables
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  // Load friends list (mutual followers)
  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [followersData, followingData] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id)
      ]);
      const followersIds = new Set((followersData || []).map(f => f.id));
      const mutualFriends = (followingData || []).filter(u => followersIds.has(u.id));
      setFriends(mutualFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, [user?.id, getFollowers, getFollowing]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  }, []);  // Load messages for specific user
  const loadMessages = async (userId, retryCount = 0) => {
    const maxRetries = 2; // Limit retries to prevent infinite loop
    
    try {
      setLoadingMessages(true);
      console.log('Loading messages for user:', userId, 'retry:', retryCount);
        const data = await messageService.getMessages(userId);
      setMessages(Array.isArray(data) ? data : []);
      
      // Only mark as read if we successfully loaded messages
      if (data) {
        try {
          await messageService.markConversationAsRead(userId);
          setConversations(prev => 
            prev.map(conv => 
              conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
            )
          );
        } catch (markReadError) {
          console.warn('Failed to mark conversation as read:', markReadError);
          // Don't show error toast for this, as messages still loaded
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // Show specific error message based on error type
      if (error.response?.status === 400 && error.response?.data?.includes('Redis')) {
        if (retryCount < maxRetries) {
          console.log(`Retrying message load (${retryCount + 1}/${maxRetries})...`);
          toast.info('Lỗi kết nối cơ sở dữ liệu. Đang thử lại...');
          
          // Retry after a short delay with exponential backoff
          setTimeout(() => {
            loadMessages(userId, retryCount + 1);
          }, 1000 * (retryCount + 1));
        } else {
          console.error('Max retries reached for loading messages');
          toast.error('Không thể kết nối cơ sở dữ liệu sau nhiều lần thử. Vui lòng làm mới trang.');
          setMessages([]); // Set empty array to show empty state
        }
      } else if (error.response?.status === 404) {
        toast.warning('Cuộc trò chuyện không tồn tại');
        setMessages([]);
      } else {
        toast.error('Không thể tải tin nhắn. Vui lòng thử lại.');
        setMessages([]); // Set empty array to show empty state
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.userId);
  };  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    try {
      setSendingMessage(true);
      const existingConv = conversations.find(conv => conv.userId === selectedConversation.userId);

      if (isConnected) {
        await sendSignalRMessage(selectedConversation.userId, messageText);
      } else {
        await messageService.sendMessage(selectedConversation.userId, messageText);
        // Only reload messages if not using SignalR (SignalR will handle updates automatically)
        await loadMessages(selectedConversation.userId);
      }

      // Add new conversation if doesn't exist
      if (!existingConv) {
        const newConversation = {
          ...selectedConversation,
          lastMessage: messageText,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        };
        setConversations(prev => [newConversation, ...prev]);
      }

      setNewMessage('');
      messageInputRef.current?.focus();    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.response?.status === 400 && error.response?.data?.includes('Redis')) {
        toast.error('Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.');
      } else if (error.response?.status === 404) {
        toast.error('Người nhận không tồn tại.');
      } else {
        toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // Start new conversation with friend
  const startNewConversation = (friend) => {
    const existingConv = conversations.find(conv => conv.userId === friend.id);
    
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      const newConversation = {
        userId: friend.id,
        userName: friend.username,
        firstName: friend.firstName,
        lastName: friend.lastName,
        profilePictureUrl: friend.profilePictureUrl,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0
      };
      setSelectedConversation(newConversation);
      setMessages([]);
    }
    setShowSearch(false);
  };

  // Handle search (maintenance mode)
  const handleSearch = () => {
    toast.info('Chức năng tìm kiếm đang được bảo trì. Vui lòng sử dụng danh sách bạn bè bên dưới.');
  };
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format time display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };// Effects
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (user?.id) loadFriends();
  }, [user?.id, loadFriends]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // SignalR listeners
  useEffect(() => {
    const handleReceiveMessage = (message) => {      if (selectedConversation && 
          (message.senderId === selectedConversation.userId || 
           message.receiverId === selectedConversation.userId)) {
        setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
      }

      setConversations(prev => 
        prev.map(conv => 
          conv.userId === message.senderId 
            ? { 
                ...conv, 
                lastMessage: message.content,
                lastMessageTime: message.sentAt,
                unreadCount: conv.userId === selectedConversation?.userId ? 0 : (conv.unreadCount || 0) + 1
              }
            : conv
        )
      );
    };    const handleMessageSent = (message) => {
      if (selectedConversation && message.receiverId === selectedConversation.userId) {
        setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
      }
    };

    onReceiveMessage(handleReceiveMessage);
    onMessageSent(handleMessageSent);    return () => {
      offReceiveMessage(handleReceiveMessage);
      offMessageSent(handleMessageSent);
    };
  }, [selectedConversation, onReceiveMessage, offReceiveMessage, onMessageSent, offMessageSent]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className={styles.container}>
      <Row className="h-100">
        {/* Left Panel - Conversations */}
        <Col md={4} className={styles.leftPanel}>
          <Card className="h-100">
            <Card.Header className={styles.header}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Tin nhắn</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <FaSearch />
                </Button>
              </div>
            </Card.Header>

            {/* Search Panel */}
            {showSearch && (
              <div className={styles.searchPanel}>
                <div className="alert alert-info mb-3" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  <strong>🔧 Bảo trì:</strong> Chức năng tìm kiếm đang được nâng cấp.
                </div>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm (đang bảo trì)..."
                  onChange={(e) => e.target.value.trim() && handleSearch()}
                  disabled
                />
              </div>
            )}

            {/* Friends List */}
            <div className={styles.friendsSection}>
              {friends.length > 0 ? (
                <ListGroup variant="flush" className={styles.friendsList}>
                  {friends.map(friend => (
                    <ListGroup.Item 
                      key={friend.id}
                      action
                      onClick={() => startNewConversation(friend)}
                      className={styles.friendItem}
                    >
                      <div className="d-flex align-items-center">
                        <div className="position-relative">
                          <img 
                            src={friend.profilePictureUrl || '/images/default-avatar.png'}
                            alt={friend.username}
                            className={styles.avatar}
                          />
                          <FaCircle className={styles.onlineIndicator} />
                        </div>
                        <div className="ms-3">
                          <div className={styles.userName}>
                            {friend.firstName && friend.lastName 
                              ? `${friend.firstName} ${friend.lastName}` 
                              : friend.username}
                          </div>
                          <small className="text-muted">@{friend.username}</small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-3 px-3" style={{ fontSize: '0.85rem' }}>
                  <div>Chưa có bạn bè nào</div>
                  <small>Bạn bè là những người bạn theo dõi và họ cũng theo dõi lại bạn</small>
                </div>
              )}
            </div>

            {/* Conversations List */}
            <ListGroup variant="flush" className={styles.conversationsList}>
              {conversations.map(conversation => (
                <ListGroup.Item 
                  key={conversation.userId}
                  action
                  active={selectedConversation?.userId === conversation.userId}
                  onClick={() => handleSelectConversation(conversation)}
                  className={styles.conversationItem}
                >
                  <div className="d-flex align-items-center">
                    <div className="position-relative">
                      <img 
                        src={conversation.profilePictureUrl || '/images/default-avatar.png'}
                        alt={conversation.userName}
                        className={styles.avatar}
                      />
                      <FaCircle className={styles.onlineIndicator} />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="d-flex justify-content-between">
                        <span className={styles.userName}>
                          {conversation.firstName && conversation.lastName 
                            ? `${conversation.firstName} ${conversation.lastName}` 
                            : conversation.userName}
                        </span>
                        {conversation.lastMessageTime && (
                          <small className="text-muted">
                            {formatTime(conversation.lastMessageTime)}
                          </small>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className={`text-muted ${styles.lastMessage}`}>
                          {conversation.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                        </small>
                        {conversation.unreadCount > 0 && (
                          <span className={styles.unreadBadge}>
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        {/* Right Panel - Messages */}
        <Col md={8} className={styles.rightPanel}>
          {selectedConversation ? (
            <Card className="h-100 d-flex flex-column">
              <Card.Header className={styles.messageHeader}>
                <div className="d-flex align-items-center">
                  <img 
                    src={selectedConversation.profilePictureUrl || '/images/default-avatar.png'}
                    alt={selectedConversation.userName}
                    className={styles.avatar}
                  />
                  <div className="ms-3">
                    <h6 className="mb-0">
                      {selectedConversation.firstName && selectedConversation.lastName 
                        ? `${selectedConversation.firstName} ${selectedConversation.lastName}` 
                        : selectedConversation.userName}
                    </h6>
                    <small className="text-muted">
                      {isConnected ? 'Đang hoạt động' : 'Offline'}
                    </small>
                  </div>
                </div>
              </Card.Header>              <Card.Body className={`${styles.messagesBody} flex-grow-1`}>
                {loadingMessages ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner animation="border" />
                  </div>                ) : Array.isArray(messages) && messages.length === 0 ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center text-muted">
                      <h6>Chưa có tin nhắn nào</h6>
                      <p>Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên!</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.messagesContainer}>
                    {Array.isArray(messages) && messages.map(message => (
                      <div 
                        key={message.id || message.messageId}
                        className={`${styles.messageItem} ${
                          message.senderId === user.id ? styles.sent : styles.received
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {message.content}
                        </div>
                        <div className={styles.messageTime}>
                          <TimeAgo date={message.sentAt} />
                          {message.senderId === user.id && message.isRead && (
                            <span className={styles.readIndicator}>✓✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </Card.Body>

              <Card.Footer className={styles.messageFooter}>
                <Form onSubmit={handleSendMessage} className="d-flex">                  <Form.Control
                    ref={messageInputRef}
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendingMessage}
                    className="me-2"
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sendingMessage}
                    variant="primary"
                  >
                    {sendingMessage ? (
                      <Spinner as="span" animation="border" size="sm" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </Button>
                </Form>
              </Card.Footer>
            </Card>
          ) : (
            <Card className="h-100">
              <Card.Body className="d-flex justify-content-center align-items-center">
                <div className="text-center text-muted">
                  <h5>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</h5>
                  <p>Hoặc chọn bạn bè để bắt đầu cuộc trò chuyện mới</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Messages;
