import React, { useState, useEffect, useRef } from 'react';
import { useSignalR } from '../../hooks/useSignalR';
import messageService from '../../services/messageService';
import ConnectionStatus from './ConnectionStatus';
import styles from './ChatWidget.module.scss';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { connection, connectionState, sendMessage, joinConversation, leaveConversation } = useSignalR();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Load conversations when widget opens
  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      loadConversations();
    }
  }, [isOpen, conversations.length]);

  // Listen for new messages
  useEffect(() => {
    if (connection) {
      const handleNewMessage = (message) => {
        if (activeConversation && message.conversationId === activeConversation.id) {
          setMessages(prev => [...prev, message]);
        }
        // Update conversation list with latest message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === message.conversationId 
              ? { ...conv, lastMessage: message, lastMessageTime: message.sentAt }
              : conv
          )
        );
      };

      connection.on('ReceiveMessage', handleNewMessage);
      return () => connection.off('ReceiveMessage', handleNewMessage);
    }
  }, [connection, activeConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await messageService.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    setLoading(true);
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    if (activeConversation?.id === conversation.id) return;
    
    // Leave current conversation
    if (activeConversation) {
      leaveConversation(activeConversation.id);
    }
    
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
    
    // Join new conversation
    joinConversation(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      await sendMessage(activeConversation.id, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
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
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderConversationList = () => (
    <div className={styles.conversationList}>
      <div className={styles.header}>
        <h3>Messages</h3>
        <ConnectionStatus />
      </div>
      
      {loading ? (
        <div className={styles.loading}>Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className={styles.empty}>No conversations yet</div>
      ) : (
        <div className={styles.conversations}>
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`${styles.conversation} ${activeConversation?.id === conversation.id ? styles.active : ''}`}
              onClick={() => handleConversationSelect(conversation)}
            >
              <div className={styles.avatar}>
                {conversation.otherParticipant?.avatar ? (
                  <img src={conversation.otherParticipant.avatar} alt="" />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {conversation.otherParticipant?.firstName?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>
                  {conversation.otherParticipant?.firstName} {conversation.otherParticipant?.lastName}
                </div>
                <div className={styles.lastMessage}>
                  {conversation.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
              <div className={styles.time}>
                {conversation.lastMessageTime && formatTime(conversation.lastMessageTime)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChatView = () => (
    <div className={styles.chatView}>
      <div className={styles.chatHeader}>
        <button 
          className={styles.backButton}
          onClick={() => setActiveConversation(null)}
        >
          ←
        </button>
        <div className={styles.participantInfo}>
          <div className={styles.avatar}>
            {activeConversation.otherParticipant?.avatar ? (
              <img src={activeConversation.otherParticipant.avatar} alt="" />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {activeConversation.otherParticipant?.firstName?.[0] || '?'}
              </div>
            )}
          </div>
          <span className={styles.name}>
            {activeConversation.otherParticipant?.firstName} {activeConversation.otherParticipant?.lastName}
          </span>
        </div>
        <ConnectionStatus compact />
      </div>

      <div className={styles.messages}>
        {loading ? (
          <div className={styles.loading}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>No messages yet. Start the conversation!</div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`${styles.message} ${message.isFromCurrentUser ? styles.sent : styles.received}`}
            >
              <div className={styles.messageContent}>
                {message.content}
              </div>
              <div className={styles.messageTime}>
                {formatTime(message.sentAt)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.messageForm} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sendingMessage || connectionState !== 'Connected'}
          className={styles.messageInput}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sendingMessage || connectionState !== 'Connected'}
          className={styles.sendButton}
        >
          {sendingMessage ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={styles.chatToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
        {conversations.some(conv => conv.hasUnreadMessages) && (
          <span className={styles.unreadBadge}></span>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className={styles.chatWidget}>
          {activeConversation ? renderChatView() : renderConversationList()}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
