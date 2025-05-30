import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/auth/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import EmojiPickerReact from 'emoji-picker-react';
import styles from './ChatWindow.module.scss';

function ChatWindow({ chatRoom }) {
  const { 
    messages, 
    typingUsers, 
    sendMessage, 
    startTyping, 
    stopTyping,
    markMessagesAsRead 
  } = useChat();
  const { user } = useAuth();
  
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [typingTimer, setTypingTimer] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Mark messages as read when chat is opened
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => !msg.isRead && msg.senderId !== user.id)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }
    }
  }, [messages, user.id, markMessagesAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim(), replyToMessage?.id);
      setMessage('');
      setReplyToMessage(null);
      setShowEmojiPicker(false);
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Clear existing timer
    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    // Set new timer to stop typing
    const timer = setTimeout(() => {
      handleStopTyping();
    }, 2000);
    
    setTypingTimer(timer);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      stopTyping();
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      setTypingTimer(null);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleReply = (messageToReply) => {
    setReplyToMessage(messageToReply);
    inputRef.current?.focus();
  };

  const getChatRoomDisplayName = () => {
    if (chatRoom.type === 0) { // Private chat
      const otherMember = chatRoom.members?.find(m => m.userId !== user.id);
      return otherMember ? `${otherMember.user.firstName} ${otherMember.user.lastName}` : 'Unknown User';
    }
    return chatRoom.name;
  };

  const getChatRoomAvatar = () => {
    if (chatRoom.type === 0) { // Private chat
      const otherMember = chatRoom.members?.find(m => m.userId !== user.id);
      return otherMember?.user.profilePictureUrl || '/default-avatar.png';
    }
    return '/group-chat-avatar.png';
  };

  const getOnlineStatus = () => {
    if (chatRoom.type === 0) { // Private chat
      const otherMember = chatRoom.members?.find(m => m.userId !== user.id);
      return otherMember?.user.isOnline;
    }
    return false;
  };

  return (
    <div className={styles.chatWindow}>
      {/* Chat Header */}
      <Card.Header className={styles.chatHeader}>
        <div className={styles.chatHeaderContent}>
          <div className={styles.chatAvatar}>
            <img 
              src={getChatRoomAvatar()} 
              alt={getChatRoomDisplayName()}
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            {getOnlineStatus() && (
              <div className={styles.onlineIndicator}></div>
            )}
          </div>
          
          <div className={styles.chatInfo}>
            <h6 className={styles.chatName}>{getChatRoomDisplayName()}</h6>
            <small className={styles.chatStatus}>
              {getOnlineStatus() ? 'Online' : 'Offline'}
              {chatRoom.type === 1 && ` • ${chatRoom.members?.length || 0} members`}
            </small>
          </div>

          <div className={styles.chatActions}>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <i className="fas fa-ellipsis-v"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <i className="fas fa-info-circle me-2"></i>
                  Chat Info
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="fas fa-search me-2"></i>
                  Search Messages
                </Dropdown.Item>
                {chatRoom.type === 1 && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item>
                      <i className="fas fa-user-plus me-2"></i>
                      Add Members
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <i className="fas fa-cog me-2"></i>
                      Group Settings
                    </Dropdown.Item>
                  </>
                )}
                <Dropdown.Divider />
                <Dropdown.Item className="text-danger">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Leave Chat
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Card.Header>

      {/* Messages Area */}
      <Card.Body className={styles.messagesContainer}>
        <MessageList 
          messages={messages} 
          currentUser={user}
          onReply={handleReply}
        />
        
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} currentUser={user} />
        
        <div ref={messagesEndRef} />
      </Card.Body>

      {/* Reply Preview */}
      {replyToMessage && (
        <div className={styles.replyPreview}>
          <div className={styles.replyContent}>
            <div className={styles.replyHeader}>
              <small>Replying to {replyToMessage.sender.firstName}</small>
              <button 
                className={styles.closeReply}
                onClick={() => setReplyToMessage(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.replyMessage}>
              {replyToMessage.content}
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <Card.Footer className={styles.messageInputContainer}>
        <MessageInput
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSend={handleSendMessage}
          onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
          showEmojiPicker={showEmojiPicker}
          disabled={false}
        />

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className={styles.emojiPickerContainer}>
            <EmojiPickerReact
              onEmojiClick={handleEmojiClick}
              width="100%"
              height="300px"
            />
          </div>
        )}
      </Card.Footer>
    </div>
  );
}

export default ChatWindow;
