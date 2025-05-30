import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSignalR } from '../hooks/useSignalR';
import messageService from '../services/messageService';
import { useAuth } from '../context/hooks';
import { useProfile } from '../context/hooks';
import ConnectionStatus from '../components/Chat/ConnectionStatus';
import styles from './Messages.module.scss';

const Messages = () => {
  const [activeFriend, setActiveFriend] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();
  const { getFollowers, getFollowing } = useProfile();
  const { connection, joinConversation, leaveConversation } = useSignalR();  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load friends list (mutual followers - bạn bè 2 chiều)
  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingFriends(true);
    try {
      const [followersData, followingData] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id)
      ]);
      
      // Lọc ra những người bạn theo dõi và họ cũng theo dõi lại bạn (bạn bè 2 chiều)
      const followersIds = new Set((followersData || []).map(f => f.id));
      const mutualFriends = (followingData || []).filter(u => followersIds.has(u.id));
      
      setFriends(mutualFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  }, [user?.id, getFollowers, getFollowing]);

  // Load messages for a specific friend's conversation
  const loadMessagesForFriend = useCallback(async (friendId) => {
    setLoading(true);
    try {
      // Get or create conversation with this friend
      const conversation = await messageService.getOrCreateConversation(friendId);
      const conversationId = conversation.id || conversation.Id;
      
      setActiveConversationId(conversationId);
      
      // Load messages for this conversation
      const response = await messageService.getMessages(conversationId);
      const messagesData = response.messages || response;
      
      if (Array.isArray(messagesData)) {
        setMessages(messagesData);
      } else {
        console.warn('Invalid messages response format:', response);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle friend selection
  const handleFriendSelect = useCallback(async (friend) => {
    if (activeFriend?.id === friend.id) return;
    
    console.log('Selecting friend:', friend);
    
    // Leave current conversation if any
    if (activeConversationId) {
      leaveConversation(activeConversationId);
    }
    
    // Set active friend immediately for better UX
    setActiveFriend(friend);
    
    // Load messages for this friend
    await loadMessagesForFriend(friend.id);
    
    // Join conversation for realtime updates
    if (activeConversationId && joinConversation) {
      joinConversation(activeConversationId);
    }
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('activeFriendId', friend.id.toString());
    } catch (error) {
      console.warn('Failed to save active friend to localStorage:', error);
    }
  }, [activeFriend, activeConversationId, leaveConversation, loadMessagesForFriend, joinConversation]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load friends when user is available
  useEffect(() => {
    if (user?.id) {
      loadFriends();
    }
  }, [user?.id, loadFriends]);

  // Restore active friend from localStorage
  useEffect(() => {
    if (friends.length > 0 && !activeFriend) {
      const savedFriendId = localStorage.getItem('activeFriendId');
      if (savedFriendId) {
        const savedFriend = friends.find(f => f.id === parseInt(savedFriendId));
        if (savedFriend) {
          handleFriendSelect(savedFriend);
        }
      }
    }
  }, [friends, activeFriend, handleFriendSelect]);

  // Listen for new messages
  useEffect(() => {
    if (connection) {      const handleNewMessage = (message) => {
        console.log('Received message via SignalR:', message);
        
        // Only add message if it's for the current active conversation
        if (!activeConversationId || message.conversationId !== activeConversationId) {
          console.log('Message not for active conversation, ignoring');
          return;
        }

        // Set isFromCurrentUser based on senderId
        const messageWithUserFlag = {
          ...message,
          isFromCurrentUser: message.senderId === user?.id
        };

        console.log('Adding message to chat:', messageWithUserFlag);

        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) {
            console.log('Message already exists, ignoring duplicate');
            return prev;
          }
          
          // Add the new message
          return [...prev, messageWithUserFlag];
        });
      };

      connection.on('ReceiveMessage', handleNewMessage);

      return () => {
        connection.off('ReceiveMessage', handleNewMessage);
      };
    }
  }, [connection, activeConversationId, user?.id]);

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeFriend || !activeConversationId || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Create optimistic message for immediate UI feedback
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: messageText,
      senderId: user.id,
      conversationId: activeConversationId,
      sentAt: new Date().toISOString(),
      isFromCurrentUser: true,
      isRead: false,
      messageType: 'text',
      isOptimistic: true
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);    try {
      console.log('Sending message via HTTP API:', messageText);
      // Always use HTTP API for reliability
      const messageResponse = await messageService.sendMessage(
        activeFriend.id, 
        messageText
      );
        console.log('Message sent successfully:', messageResponse);
      
      // Replace optimistic message with real message from server
      const realMessage = {
        id: messageResponse.MessageData?.Id || messageResponse.MessageData?.id || Date.now(),
        content: messageText,
        senderId: user.id,
        conversationId: activeConversationId,
        sentAt: messageResponse.MessageData?.SentAt || messageResponse.MessageData?.sentAt || new Date().toISOString(),
        isFromCurrentUser: true,
        isRead: false,
        messageType: 'text'
      };
      
      console.log('Replacing optimistic message with real message:', realMessage);
      
      // Replace optimistic message with real message
      setMessages(prev => {
        console.log('Previous messages count:', prev.length);
        console.log('Optimistic message id to remove:', optimisticMessage.id);
        const filtered = prev.filter(m => m.id !== optimisticMessage.id);
        console.log('After filtering optimistic, count:', filtered.length);
        const newMessages = [...filtered, realMessage];
        console.log('After adding real message, count:', newMessages.length);
        return newMessages;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      
      // Restore message text
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  // Filter friends based on search term
  const filteredFriends = friends.filter(friend =>
    friend.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className={styles.messagesPage}>
      {/* Sidebar with friends only */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Messages</h2>
          <ConnectionStatus />
        </div>
        
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Friends Section Only */}
        <div className={styles.friendsSection}>
          <h3 className={styles.sectionTitle}>Bạn bè</h3>
          {loadingFriends ? (
            <div className={styles.loading}>Đang tải bạn bè...</div>
          ) : filteredFriends.length === 0 ? (
            <div className={styles.empty}>
              {searchTerm ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
            </div>
          ) : (
            <div className={styles.friendsList}>
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  className={`${styles.friendItem} ${activeFriend?.id === friend.id ? styles.active : ''}`}
                  onClick={() => handleFriendSelect(friend)}
                >
                  <div className={styles.avatar}>
                    {friend.profilePictureUrl ? (
                      <img src={friend.profilePictureUrl} alt={friend.username} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {friend.firstName?.[0] || friend.username?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className={styles.friendInfo}>
                    <div className={styles.name}>
                      {friend.firstName && friend.lastName 
                        ? `${friend.firstName} ${friend.lastName}` 
                        : friend.username}
                    </div>
                    <small className={styles.username}>@{friend.username}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className={styles.chatArea}>
        {activeFriend ? (
          <>
            {/* Chat header */}
            <div className={styles.chatHeader}>
              <div className={styles.participantInfo}>
                <div className={styles.avatar}>
                  {activeFriend.profilePictureUrl ? (
                    <img src={activeFriend.profilePictureUrl} alt={activeFriend.username} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {activeFriend.firstName?.[0] || activeFriend.username?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className={styles.participantDetails}>
                  <h3 className={styles.name}>
                    {activeFriend.firstName && activeFriend.lastName 
                      ? `${activeFriend.firstName} ${activeFriend.lastName}` 
                      : activeFriend.username}
                  </h3>
                  <div className={styles.status}>
                    {activeFriend.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className={styles.chatActions}>
                <button className={styles.actionButton}>📞</button>
                <button className={styles.actionButton}>📹</button>
                <button className={styles.actionButton}>ⓘ</button>
              </div>
            </div>

            {/* Messages area */}
            <div className={styles.messagesArea}>
              {loading ? (
                <div className={styles.loading}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>💬</div>
                  <h3>No messages yet</h3>
                  <p>Start the conversation with {activeFriend.firstName || activeFriend.username}!</p>
                </div>
              ) : (
                <div className={styles.messagesList}>
                  {messages.map((message, index) => {
                    const isConsecutive = index > 0 && 
                      messages[index - 1].senderId === message.senderId &&
                      new Date(message.sentAt) - new Date(messages[index - 1].sentAt) < 300000; // 5 minutes

                    return (
                      <div
                        key={message.id}
                        className={`${styles.message} ${message.isFromCurrentUser ? styles.sent : styles.received} ${isConsecutive ? styles.consecutive : ''}`}
                      >
                        {!message.isFromCurrentUser && !isConsecutive && (
                          <div className={styles.messageAvatar}>
                            {activeFriend.profilePictureUrl ? (
                              <img src={activeFriend.profilePictureUrl} alt="" />
                            ) : (
                              <div className={styles.avatarPlaceholder}>
                                {activeFriend.firstName?.[0] || activeFriend.username?.[0] || '?'}
                              </div>
                            )}
                          </div>
                        )}
                        <div className={styles.messageContent}>
                          <div className={styles.messageText}>
                            {message.content}
                          </div>
                          <div className={styles.messageTime}>
                            {formatTime(message.sentAt)}
                            {message.isFromCurrentUser && (
                              <span className={styles.messageStatus}>
                                {message.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message input */}
            <div className={styles.messageInput}>
              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <div className={styles.inputArea}>
                  <button type="button" className={styles.attachButton}>📎</button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sendingMessage}
                    className={styles.textInput}
                  />
                  <button type="button" className={styles.emojiButton}>😊</button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className={styles.sendButton}
                >
                  {sendingMessage ? '⏳' : '➤'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.noConversation}>
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeIcon}>💬</div>
              <h2>Welcome to Messages</h2>
              <p>Select a friend to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
