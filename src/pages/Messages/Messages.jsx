import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Form, Badge, Spinner, Tab, Nav } from 'react-bootstrap';
import { FaSearch, FaPaperPlane, FaCircle, FaArrowLeft, FaUserFriends, FaComments } from 'react-icons/fa';
import { useAuth, useProfile } from '../../context/hooks';
import { useSignalR } from '../../context/SignalRContext';
import messageService from '../../services/messageService';
import { toast } from 'react-toastify';
import TimeAgo from 'react-timeago';
import styles from './styles/Messages.module.scss';

const Messages = () => {
  const { user } = useAuth();
  const { getFollowers, getFollowing } = useProfile();
  const { 
    isConnected, 
    onReceiveMessage, 
    offReceiveMessage, 
    onMessageSent, 
    offMessageSent,
    sendMessage: sendSignalRMessage 
  } = useSignalR();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Friends states
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);  // Load friends data
  useEffect(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // SignalR message listeners
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      // Add to messages if it's for current conversation
      if (selectedConversation && 
          (message.senderId === selectedConversation.userId || 
           message.receiverId === selectedConversation.userId)) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversations list
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

      // Mark as read if conversation is open
      if (selectedConversation && message.senderId === selectedConversation.userId) {
        markMessageAsRead(message.messageId);
      }
    };

    const handleMessageSent = (message) => {
      // Add to messages for current conversation
      if (selectedConversation && message.receiverId === selectedConversation.userId) {
        setMessages(prev => [...prev, message]);
      }
    };

    onReceiveMessage(handleReceiveMessage);
    onMessageSent(handleMessageSent);

    return () => {
      offReceiveMessage(handleReceiveMessage);
      offMessageSent(handleMessageSent);
    };
  }, [selectedConversation, onReceiveMessage, offReceiveMessage, onMessageSent, offMessageSent]);
  const loadConversations = async () => {    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };
  const fetchFriendsData = useCallback(async () => {
    if (!user) {
      setLoadingFriends(false);
      return;
    }
    
    try {
      setLoadingFriends(true);
      
      const [followersData, followingData] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id)
      ]);
      
      // Create friends list (mutual follows)
      const followersIds = new Set((followersData || []).map(f => f.id));
      const mutualFriends = (followingData || []).filter(u => followersIds.has(u.id));
      setFriends(mutualFriends);
      
    } catch (error) {
      console.error('Error fetching friends data:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách bạn bè');
    } finally {
      setLoadingFriends(false);
    }
  }, [user, getFollowers, getFollowing]);

  const loadMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      const data = await messageService.getMessages(userId);
      setMessages(data);
      
      // Mark conversation as read
      await messageService.markConversationAsRead(userId);
        // Update unread count in conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await messageService.markAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.userId);
    if (isMobile) {
      // Hide conversations list on mobile
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      
      // Send via SignalR for real-time
      if (isConnected) {
        await sendSignalRMessage(selectedConversation.userId, newMessage.trim());
      } else {
        // Fallback to HTTP if SignalR not connected
        await messageService.sendMessage(selectedConversation.userId, newMessage.trim());
        // Reload messages
        await loadMessages(selectedConversation.userId);
      }      setNewMessage('');
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }    try {
      const results = await messageService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Không thể tìm kiếm người dùng');
    }
  };
  const startNewConversation = async (user) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.userId === user.id);
    
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      // Create new conversation entry
      const newConversation = {
        userId: user.id,
        userName: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([]);
    }
    
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  const startConversationWithFriend = async (friend) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.userId === friend.id);
    
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      // Create new conversation entry
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
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([]);
    }
    
    // Switch to conversations tab after starting chat
    setActiveTab('conversations');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className={styles.messagesContainer}>
      <Row className="h-100">
        {/* Conversations List */}
        <Col 
          md={4} 
          className={`${styles.conversationsPanel} ${isMobile && selectedConversation ? 'd-none' : ''}`}
        >          <Card className="h-100">
            <Card.Header className={styles.conversationsHeader}>
              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="tabs" className="justify-content-center">
                  <Nav.Item>
                    <Nav.Link eventKey="friends">
                      <FaUserFriends className="me-1" />
                      Bạn bè ({friends.length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="conversations">
                      <FaComments className="me-1" />
                      Trò chuyện
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                
                <div className="d-flex justify-content-end mt-2">
                  {activeTab === 'conversations' && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setShowSearch(!showSearch)}
                    >
                      <FaSearch />
                    </Button>
                  )}
                </div>
              </Tab.Container>            </Card.Header>

            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              <Tab.Content>
                <Tab.Pane eventKey="friends">
                  {loadingFriends ? (
                    <div className="d-flex justify-content-center p-4">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center p-4 text-muted">
                      <FaUserFriends size={50} className="mb-3" />
                      <h6>Chưa có bạn bè nào</h6>
                      <p>Bạn bè là những người mà bạn theo dõi và họ cũng theo dõi lại bạn.</p>
                    </div>
                  ) : (
                    <ListGroup variant="flush" className={styles.friendsList}>
                      {friends.map(friend => (
                        <ListGroup.Item 
                          key={friend.id}
                          action
                          onClick={() => startConversationWithFriend(friend)}
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
                            <div className="flex-grow-1 ms-3">
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
                  )}
                </Tab.Pane>
                
                <Tab.Pane eventKey="conversations">
                  {showSearch && (
                    <div className={styles.searchPanel}>
                      <Form.Control
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        className="mb-2"
                      />
                      {searchResults.length > 0 && (
                        <ListGroup className={styles.searchResults}>
                          {searchResults.map(user => (
                            <ListGroup.Item 
                              key={user.id}
                              action
                              onClick={() => startNewConversation(user)}
                              className={styles.searchResultItem}
                            >
                              <div className="d-flex align-items-center">
                                <img 
                                  src={user.profilePictureUrl || '/images/default-avatar.png'}
                                  alt={user.username}
                                  className={styles.avatar}
                                />
                                <div className="ms-2">
                                  <div className={styles.userName}>
                                    {user.firstName && user.lastName 
                                      ? `${user.firstName} ${user.lastName}` 
                                      : user.username}
                                  </div>
                                  <small className="text-muted">@{user.username}</small>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}

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
                          <Badge bg="primary" className={styles.unreadBadge}>
                            {conversation.unreadCount}
                          </Badge>                        )}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Card>
        </Col>

        {/* Messages Panel */}
        <Col 
          md={8} 
          className={`${styles.messagesPanel} ${isMobile && !selectedConversation ? 'd-none' : ''}`}
        >
          {selectedConversation ? (
            <Card className="h-100 d-flex flex-column">
              <Card.Header className={styles.messageHeader}>
                <div className="d-flex align-items-center">
                  {isMobile && (
                    <Button 
                      variant="link" 
                      onClick={() => setSelectedConversation(null)}
                      className="me-2 p-0"
                    >
                      <FaArrowLeft />
                    </Button>
                  )}
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
              </Card.Header>

              <Card.Body className={`${styles.messagesBody} flex-grow-1`}>
                {loadingMessages ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <div className={styles.messagesContainer}>
                    {messages.map(message => (
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
                <Form onSubmit={handleSendMessage} className="d-flex">
                  <Form.Control
                    ref={messageInputRef}
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendingMessage || !isConnected}
                    className="me-2"
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sendingMessage || !isConnected}
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
                  <p>Hoặc tìm kiếm người dùng để bắt đầu cuộc trò chuyện mới</p>
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
