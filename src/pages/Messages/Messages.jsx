import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup } from 'react-bootstrap';
import { FaComments, FaSearch, FaPaperPlane, FaUser, FaCircle, FaUserFriends, FaImage, FaVideo, FaFile, FaPaperclip, FaSmile, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSignalR } from '../../context/SignalRContext';
import { useAuth, useProfile } from '../../context/hooks';
import messageService from '../../services/messageService';
import styles from './Messages.module.scss';

const Messages = () => {  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  
  const { connection, isConnected } = useSignalR();
  const { user } = useAuth();
  const { getFollowers, getFollowing } = useProfile();

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await messageService.getConversations();
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Không thể tải danh sách cuộc trò chuyện');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch friends (mutual follows) on component mount
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      
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
        console.error('Error fetching friends:', error);
        // Don't show error toast as this is optional feature
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [user, getFollowers, getFollowing]);
  // Setup SignalR listeners
  useEffect(() => {
    console.log('SignalR Status:', { connection: !!connection, isConnected });
    
    if (!connection || !isConnected) return;

    const handleReceiveMessage = (messageData) => {
      console.log('Received message via SignalR:', messageData);
      const newMsg = {
        id: messageData.id || Date.now(),
        content: messageData.content || messageData.message,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        timestamp: new Date(messageData.timestamp || Date.now()),
        isRead: false
      };

      // Add to messages if this conversation is selected
      if (selectedConversation && 
          (messageData.conversationId === selectedConversation.id ||
           messageData.senderId === selectedConversation.otherUser?.id)) {
        setMessages(prev => [...prev, newMsg]);
      }

      // Update conversations list
      setConversations(prev => {
        const updated = [...prev];
        const convIndex = updated.findIndex(conv => 
          conv.id === messageData.conversationId ||
          conv.otherUser?.id === messageData.senderId
        );
        
        if (convIndex >= 0) {
          updated[convIndex] = {
            ...updated[convIndex],
            lastMessage: newMsg.content,
            lastMessageTime: newMsg.timestamp,
            unreadCount: (updated[convIndex].unreadCount || 0) + 1
          };
          // Move to top
          const [conversation] = updated.splice(convIndex, 1);
          updated.unshift(conversation);
        }
        
        return updated;
      });

      // Show notification if not on current conversation
      if (!selectedConversation || selectedConversation.otherUser?.id !== messageData.senderId) {
        toast.info(`Tin nhắn mới từ ${messageData.senderName}: ${newMsg.content}`);
      }
    };

    connection.on('ReceiveMessage', handleReceiveMessage);

    return () => {
      connection.off('ReceiveMessage', handleReceiveMessage);
    };
  }, [connection, isConnected, selectedConversation]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages for selected conversation
  const loadMessages = async (conversation) => {
    try {
      setLoadingMessages(true);
      const data = await messageService.getMessages(conversation.id);
      setMessages(data || []);
      
      // Mark as read
      if (conversation.unreadCount > 0) {
        await messageService.markAsRead(conversation.id);
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };
  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation);
  };

  // Start new conversation with a friend
  const startNewConversation = async (friend) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.otherUser?.id === friend.id
      );
      
      if (existingConversation) {
        // Select existing conversation
        handleSelectConversation(existingConversation);
        return;
      }
      
      // Create new conversation
      const conversation = await messageService.getOrCreateConversation(friend.id);
      
      // Add to conversations list
      const newConversation = {
        id: conversation.id,
        otherUser: {
          id: friend.id,
          userName: friend.userName,
          email: friend.email,
          profilePicture: friend.profilePictureUrl
        },
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([]);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Không thể bắt đầu cuộc trò chuyện');
    }
  };

  // Handle file selection
  const handleFileSelect = (event, fileType) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 50MB.`);
        return false;
      }

      if (fileType === 'image' && !file.type.startsWith('image/')) {
        toast.error(`File ${file.name} không phải là hình ảnh.`);
        return false;
      }

      if (fileType === 'video' && !file.type.startsWith('video/')) {
        toast.error(`File ${file.name} không phải là video.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles.map(file => ({
        file,
        type: fileType,
        preview: fileType === 'image' ? URL.createObjectURL(file) : null
      }))]);
    }

    // Reset input
    event.target.value = '';
    setShowAttachmentMenu(false);
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  // Send message with attachments
  const sendMessageWithAttachments = async () => {
    if (!selectedConversation) {
      toast.error('Vui lòng chọn cuộc trò chuyện');
      return;
    }
    
    if (!newMessage.trim() && selectedFiles.length === 0) {
      toast.error('Vui lòng nhập tin nhắn hoặc chọn file');
      return;
    }

    try {
      setSendingMessage(true);

      if (selectedFiles.length > 0) {
        // Send message with files via HTTP
        console.log('Sending message with files:', selectedFiles);
        await messageService.sendMessage(
          selectedConversation.otherUser?.id,
          newMessage.trim() || 'Đã gửi file đính kèm',
          selectedFiles.map(f => f.file)
        );
        
        // Clear inputs after successful send
        setNewMessage('');
        setSelectedFiles([]);
        
        // Reload messages to show the new message
        setTimeout(() => {
          loadMessages(selectedConversation);
        }, 500);
        
      } else if (isConnected && connection) {
        // Send text message via SignalR
        console.log('Sending text message via SignalR');
        const messageData = {
          conversationId: selectedConversation.id,
          receiverId: selectedConversation.otherUser?.id,
          content: newMessage.trim()
        };

        await connection.invoke('SendMessage', messageData);
        
        // Add to local messages immediately for better UX
        const tempMessage = {
          id: Date.now(),
          content: newMessage.trim(),
          senderId: user.id,
          senderName: user.userName || user.email,
          timestamp: new Date(),
          isRead: false
        };
        
        setMessages(prev => [...prev, tempMessage]);
        
        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: tempMessage.content, lastMessageTime: tempMessage.timestamp }
            : conv
        ));
        
        // Clear input after successful send
        setNewMessage('');
        
      } else {
        // Fallback to HTTP when SignalR is not available
        console.log('Sending text message via HTTP (SignalR not available)');
        await messageService.sendMessage(
          selectedConversation.otherUser?.id,
          newMessage.trim()
        );
        
        // Clear input and reload messages
        setNewMessage('');
        setTimeout(() => {
          loadMessages(selectedConversation);
        }, 500);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setSendingMessage(false);
    }
  };

  // Update handleSendMessage to use the new function
  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendMessageWithAttachments();
  };

  // Handle attachment menu toggle
  const toggleAttachmentMenu = () => {
    setShowAttachmentMenu(prev => !prev);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <Container className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải tin nhắn...</p>
      </Container>
    );
  }

  return (
    <Container fluid className={styles.messagesContainer}>
      <Row className={styles.messagesRow}>
        {/* Conversations Sidebar */}
        <Col lg={4} md={5} className={styles.conversationsSidebar}>
          <Card className={styles.sidebarCard}>
            <Card.Header className={styles.sidebarHeader}>
              <h4>
                <FaComments className={styles.headerIcon} />
                Tin nhắn
                {!isConnected && <Badge bg="warning" className="ms-2">Offline</Badge>}
              </h4>
              
              <InputGroup className={styles.searchGroup}>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />              </InputGroup>
            </Card.Header>
            
            {/* Friends List Section */}
            {friends.length > 0 && (
              <div className={styles.friendsSection}>
                <div className={styles.friendsHeader}>
                  <h6>
                    <FaUserFriends className={styles.friendsIcon} />
                    Bạn bè ({friends.length})
                  </h6>
                </div>
                <div className={styles.friendsList}>
                  {loadingFriends ? (
                    <div className={styles.loadingFriends}>
                      <div className={styles.spinner}></div>
                    </div>
                  ) : (
                    friends.slice(0, 5).map((friend) => (
                      <div
                        key={friend.id}
                        className={styles.friendItem}
                        onClick={() => startNewConversation(friend)}
                        title={`Nhắn tin với ${friend.userName || friend.email}`}
                      >
                        <div className={styles.friendAvatar}>
                          {friend.profilePictureUrl ? (
                            <img 
                              src={friend.profilePictureUrl} 
                              alt={friend.userName}
                            />
                          ) : (
                            <FaUser />
                          )}
                        </div>
                        <span className={styles.friendName}>
                          {friend.userName || friend.email}
                        </span>
                      </div>
                    ))
                  )}
                  {friends.length > 5 && (
                    <div className={styles.moreFriends}>
                      +{friends.length - 5} bạn khác
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className={styles.conversationsList}>
              {filteredConversations.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaComments className={styles.emptyIcon} />
                  <p>Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`${styles.conversationItem} ${
                      selectedConversation?.id === conversation.id ? styles.active : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className={styles.avatar}>
                      {conversation.otherUser?.profilePicture ? (
                        <img 
                          src={conversation.otherUser.profilePicture} 
                          alt={conversation.otherUser.userName}
                        />
                      ) : (
                        <FaUser />
                      )}
                      <FaCircle className={styles.onlineStatus} />
                    </div>
                    
                    <div className={styles.conversationInfo}>
                      <div className={styles.userName}>
                        {conversation.otherUser?.userName || conversation.otherUser?.email}
                        {conversation.unreadCount > 0 && (
                          <Badge bg="primary" className={styles.unreadBadge}>
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className={styles.lastMessage}>
                        {conversation.lastMessage || 'Chưa có tin nhắn'}
                      </div>
                    </div>
                    
                    <div className={styles.timestamp}>
                      {conversation.lastMessageTime && formatTime(conversation.lastMessageTime)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>

        {/* Chat Area */}
        <Col lg={8} md={7} className={styles.chatArea}>
          {selectedConversation ? (
            <Card className={styles.chatCard}>
              <Card.Header className={styles.chatHeader}>
                <div className={styles.chatUserInfo}>
                  <div className={styles.avatar}>
                    {selectedConversation.otherUser?.profilePicture ? (
                      <img 
                        src={selectedConversation.otherUser.profilePicture} 
                        alt={selectedConversation.otherUser.userName}
                      />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div>
                    <h5>{selectedConversation.otherUser?.userName || selectedConversation.otherUser?.email}</h5>
                    <span className={styles.onlineStatus}>
                      <FaCircle /> Đang hoạt động
                    </span>
                  </div>
                </div>
              </Card.Header>
              
              <div className={styles.messagesArea}>
                {loadingMessages ? (
                  <div className={styles.loadingMessages}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải tin nhắn...</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`${styles.messageItem} ${
                          message.senderId === user?.id ? styles.sent : styles.received
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {message.content}
                        </div>
                        <div className={styles.messageTime}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
                <Card.Footer className={styles.messageInput}>
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className={styles.selectedFilesPreview}>
                    {selectedFiles.map((fileItem, index) => (
                      <div key={index} className={styles.filePreviewItem}>
                        {fileItem.type === 'image' && fileItem.preview ? (
                          <img src={fileItem.preview} alt="Preview" className={styles.imagePreview} />
                        ) : (
                          <div className={styles.fileIcon}>
                            {fileItem.type === 'video' ? <FaVideo /> : <FaFile />}
                            <span>{fileItem.file.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className={styles.removeFileBtn}
                          onClick={() => removeSelectedFile(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Form onSubmit={handleSendMessage}>
                  <div className={styles.messageInputContainer}>
                    {/* Attachment Button */}
                    <div className={styles.attachmentSection}>
                      <Button
                        variant="link"
                        className={styles.attachmentBtn}
                        onClick={toggleAttachmentMenu}
                        type="button"
                      >
                        <FaPaperclip />
                      </Button>
                      
                      {/* Attachment Menu */}
                      {showAttachmentMenu && (
                        <div className={styles.attachmentMenu}>
                          <button
                            type="button"
                            className={styles.attachmentOption}
                            onClick={() => imageInputRef.current?.click()}
                          >
                            <FaImage />
                            <span>Hình ảnh</span>
                          </button>
                          <button
                            type="button"
                            className={styles.attachmentOption}
                            onClick={() => videoInputRef.current?.click()}
                          >
                            <FaVideo />
                            <span>Video</span>
                          </button>
                          <button
                            type="button"
                            className={styles.attachmentOption}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FaFile />
                            <span>Tệp tin</span>
                          </button>
                        </div>
                      )}
                    </div>                    {/* Message Input */}
                    <div className={styles.textInputSection}>                      <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder={
                          !selectedConversation 
                            ? "Chọn cuộc trò chuyện để nhắn tin..." 
                            : sendingMessage 
                              ? "Đang gửi..." 
                              : "Nhập tin nhắn..."
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sendingMessage || !selectedConversation}
                        className={styles.messageTextInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>

                    {/* Emoji Button */}
                    <Button
                      variant="link"
                      className={styles.emojiBtn}
                      type="button"
                    >
                      <FaSmile />
                    </Button>                    {/* Send Button */}
                    <Button 
                      type="submit" 
                      disabled={(!newMessage.trim() && selectedFiles.length === 0) || sendingMessage || !selectedConversation}
                      className={styles.sendBtn}
                      variant="primary"
                    >
                      {sendingMessage ? (
                        <div className={styles.sendingSpinner}></div>
                      ) : (
                        <FaPaperPlane />
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, 'video')}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, 'file')}
                />
              </Card.Footer>
            </Card>
          ) : (
            <div className={styles.noConversationSelected}>
              <FaComments className={styles.emptyIcon} />
              <h3>Chọn một cuộc trò chuyện</h3>
              <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Messages;
