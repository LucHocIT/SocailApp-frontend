import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Form, Button, Dropdown, Alert } from 'react-bootstrap';
import chatService from '../../services/chatService';
import MessageList from './message/MessageList';
import MessageInput from './message/MessageInput';
import BlockStatusIndicator from '../user/BlockStatusIndicator';
import BlockUserButton from '../user/BlockUserButton';
import { useBlockStatus } from '../../hooks/useBlockStatus';
import { toast } from 'react-toastify';
import './ChatWindow.scss';

const ChatWindow = ({ conversation, currentUserId, onlineUsers }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const messagesEndRef = useRef(null);  // Get other user ID from conversation
  const getOtherUserId = () => {
    if (!conversation) return null;
    return conversation.otherUserId;
  };
  // Get other user info
  const getOtherUser = () => {
    if (!conversation) return { name: 'Unknown' };
    return {
      id: conversation.otherUserId,
      name: conversation.otherUserName,
      avatar: conversation.otherUserAvatar
    };
  };// Block status
  const { status, canCommunicate, loading: _blockLoading } = useBlockStatus(getOtherUserId());
  const otherUser = getOtherUser();

  // Function to remove duplicate messages based on ID and timestamp
  const removeDuplicateMessages = (messageArray) => {
    const seen = new Set();
    return messageArray.filter(message => {
      // Create unique identifier using ID and timestamp
      const identifier = `${message.id}-${new Date(message.sentAt).getTime()}`;
      
      if (seen.has(identifier)) {
        console.log('Removing duplicate message:', message.id);
        return false;
      }
      
      seen.add(identifier);
      return true;
    });
  };

  const loadMessages = useCallback(async (reset = false) => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const response = await chatService.getConversationMessages(
        conversation.id, 
        currentPage, 
        50
      );      if (reset) {
        // Remove duplicates when setting new messages
        const uniqueMessages = removeDuplicateMessages(response.messages || []);
        setMessages(uniqueMessages);
        setPage(2);
      } else {
        // Remove duplicates when appending messages
        const newMessages = response.messages || [];
        setMessages(prev => {
          const combined = [...newMessages, ...prev];
          return removeDuplicateMessages(combined);
        });
        setPage(prev => prev + 1);
      }

      setHasMore(response.hasMore || false);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);    }
  }, [conversation, page]);  const handleReactionEvent = useCallback((reactionEvent) => {
    if (!conversation?.id || reactionEvent.conversationId !== conversation.id) return;
    
    setMessages(prev => {
      return prev.map(message => {
        if (message.id === reactionEvent.messageId) {
          const updatedMessage = { ...message };
          
          // If we have complete reaction summary from server, use it
          if (reactionEvent.reactionSummary) {
            updatedMessage.reactionCounts = reactionEvent.reactionSummary.reactionCounts || {};
            updatedMessage.hasReactedByCurrentUser = reactionEvent.reactionSummary.hasReactedByCurrentUser || false;
            updatedMessage.currentUserReactionType = reactionEvent.reactionSummary.currentUserReactionType || null;
            updatedMessage.totalReactions = Object.values(updatedMessage.reactionCounts).reduce((sum, count) => sum + count, 0);
          } else {
            // Fallback to manual calculation for backward compatibility
            if (reactionEvent.type === 'reactionAdded') {
              // Update reaction counts
              const { reaction } = reactionEvent;
              updatedMessage.reactionCounts = {
                ...updatedMessage.reactionCounts,
                [reaction.reactionType]: (updatedMessage.reactionCounts?.[reaction.reactionType] || 0) + 1
              };
              
              // If it's current user's reaction, update current user reaction status
              if (reaction.userId === currentUserId) {
                updatedMessage.hasReactedByCurrentUser = true;
                updatedMessage.currentUserReactionType = reaction.reactionType;
              }
              
            } else if (reactionEvent.type === 'reactionRemoved') {
              // Update reaction counts
              if (updatedMessage.reactionCounts && reactionEvent.reactionType) {
                const currentCount = updatedMessage.reactionCounts[reactionEvent.reactionType] || 0;
                if (currentCount > 0) {
                  updatedMessage.reactionCounts = {
                    ...updatedMessage.reactionCounts,
                    [reactionEvent.reactionType]: currentCount - 1
                  };
                  
                  // Remove the reaction type if count reaches 0
                  if (updatedMessage.reactionCounts[reactionEvent.reactionType] === 0) {
                    const { [reactionEvent.reactionType]: _, ...remainingCounts } = updatedMessage.reactionCounts;
                    updatedMessage.reactionCounts = remainingCounts;
                  }
                }
              }
              
              // Remove current user's reaction if it's their reaction being removed
              if (reactionEvent.userId === currentUserId) {
                updatedMessage.hasReactedByCurrentUser = false;
                updatedMessage.currentUserReactionType = null;
              }
            }
            
            // Update total reactions count
            updatedMessage.totalReactions = Object.values(updatedMessage.reactionCounts).reduce((sum, count) => sum + count, 0);
          }
          
          return updatedMessage;
        }
        return message;
      });
    });
  }, [conversation, currentUserId]);
  const handleNewMessage = useCallback((message) => {
    if (message.type === 'messageRead') return;
    
    // Handle message deletion events
    if (message.type === 'messageDeleted') {
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === message.messageId) {
            return {
              ...msg,
              content: 'Tin nhắn đã được xóa',
              isDeleted: true,
              mediaUrl: null,
              mediaType: null,
              reactionCounts: {}
            };
          }
          return msg;
        });
      });
      return;
    }
    
    // Handle reaction events
    if (message.type === 'reactionAdded' || message.type === 'reactionRemoved' || message.type === 'reactionUpdated') {
      handleReactionEvent(message);
      return;
    }
    
    // Handle both direct ReceiveMessage and NewMessage events
    if (message.conversationId === conversation?.id || 
        (!message.conversationId && message.type !== 'newMessage')) {
      // For direct ReceiveMessage events, add to messages with duplicate prevention
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(existingMsg => 
          existingMsg.id === message.id || 
          (existingMsg.content === message.content && 
           existingMsg.senderId === message.senderId && 
           Math.abs(new Date(existingMsg.sentAt) - new Date(message.sentAt)) < 1000) // Within 1 second
        );
        
        if (messageExists) {
          console.log('Duplicate message detected, skipping:', message.id);
          return prev;
        }
        
        return [...prev, message];
      });
      
      // If the message is from another user and we're currently viewing this conversation,
      // automatically mark it as read
      if (message.senderId !== currentUserId && message.conversationId === conversation?.id) {
        // Mark as read immediately - the user is actively viewing the conversation
        chatService.markConversationAsRead(conversation.id).catch(error => {
          console.error('Error auto-marking message as read:', error);
        });
      }    }
  }, [conversation, currentUserId, handleReactionEvent]);
  useEffect(() => {
    if (conversation) {
      loadMessages(true);
      
      // Automatically mark conversation as read when opening it
      // This ensures that if there are unread messages, they get marked as read
      if (conversation.unreadCount > 0) {
        chatService.markConversationAsRead(conversation.id).catch(error => {
          console.error('Error marking conversation as read on open:', error);
        });
      }
    }
  }, [conversation, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const removeHandler = chatService.onMessageReceived(handleNewMessage);
    return removeHandler;
  }, [handleNewMessage]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || !conversation) return;

    try {
      // Send via SignalR for real-time delivery
      await chatService.sendSignalRMessage(
        conversation.id, 
        content.trim(), 
        replyToMessage?.id
      );
      
      // Clear reply
      setReplyToMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMessages(false);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOfflineTime = (lastActive) => {
    if (!lastActive) return '';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Vừa mới hoạt động';
    if (diffMinutes < 60) return `Hoạt động ${diffMinutes} phút trước`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hoạt động ${diffDays} ngày trước`;
  };
  const handleReplyToMessage = (message) => {
    setReplyToMessage(message);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // Optimistic update - immediately mark as deleted
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              content: 'Tin nhắn đã được xóa',
              isDeleted: true,
              mediaUrl: null,
              mediaType: null,
              reactionCounts: {}
            };
          }
          return msg;
        });
      });

      // Call API to delete message
      await chatService.deleteMessage(messageId);
      toast.success('Đã xóa tin nhắn');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Không thể xóa tin nhắn');
      
      // Rollback optimistic update on error
      loadMessages(true);
    }
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  // Scroll to specific message function
  const scrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight effect
      messageElement.style.transition = 'background-color 0.3s ease';
      messageElement.style.backgroundColor = 'rgba(24, 119, 242, 0.1)';
      
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
    }
  };
  const handleReactionToggle = useCallback((messageId, reactionType, userId, isRollback = false) => {
    setMessages(prev => {
      return prev.map(message => {
        if (message.id === messageId) {
          const updatedMessage = { ...message };
          
          // Initialize reaction data if not exists
          if (!updatedMessage.reactionCounts) {
            updatedMessage.reactionCounts = {};
          }
          
          // Determine if user currently has this reaction
          const userHasThisReaction = updatedMessage.hasReactedByCurrentUser && 
                                      updatedMessage.currentUserReactionType === reactionType;
          
          if (isRollback) {
            // Rollback the optimistic update
            return message; // Revert to original state
          }
          
          if (userHasThisReaction) {
            // User is removing their reaction
            const currentCount = updatedMessage.reactionCounts[reactionType] || 0;
            if (currentCount > 0) {
              updatedMessage.reactionCounts = {
                ...updatedMessage.reactionCounts,
                [reactionType]: currentCount - 1
              };
              
              // Remove the reaction type if count reaches 0
              if (updatedMessage.reactionCounts[reactionType] === 0) {
                const { [reactionType]: _, ...remainingCounts } = updatedMessage.reactionCounts;
                updatedMessage.reactionCounts = remainingCounts;
              }
            }
            
            // Update user reaction status
            if (userId === currentUserId) {
              updatedMessage.hasReactedByCurrentUser = false;
              updatedMessage.currentUserReactionType = null;
            }
          } else {
            // User is adding a new reaction or changing reaction
            
            // If user had a different reaction, remove it first
            if (updatedMessage.hasReactedByCurrentUser && updatedMessage.currentUserReactionType) {
              const oldReactionType = updatedMessage.currentUserReactionType;
              const oldCount = updatedMessage.reactionCounts[oldReactionType] || 0;
              if (oldCount > 0) {
                updatedMessage.reactionCounts = {
                  ...updatedMessage.reactionCounts,
                  [oldReactionType]: oldCount - 1
                };
                
                // Remove the old reaction type if count reaches 0
                if (updatedMessage.reactionCounts[oldReactionType] === 0) {
                  const { [oldReactionType]: _, ...remainingCounts } = updatedMessage.reactionCounts;
                  updatedMessage.reactionCounts = remainingCounts;
                }
              }
            }
            
            // Add the new reaction
            updatedMessage.reactionCounts = {
              ...updatedMessage.reactionCounts,
              [reactionType]: (updatedMessage.reactionCounts[reactionType] || 0) + 1
            };
            
            // Update user reaction status
            if (userId === currentUserId) {
              updatedMessage.hasReactedByCurrentUser = true;
              updatedMessage.currentUserReactionType = reactionType;
            }
          }
          
          // Update total reactions count
          updatedMessage.totalReactions = Object.values(updatedMessage.reactionCounts).reduce((sum, count) => sum + count, 0);
          
          return updatedMessage;
        }
        return message;
      });
    });
  }, [currentUserId]);

  // useEffect để cập nhật trạng thái mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render để cập nhật thời gian offline
      setMessages(prev => [...prev]);
    }, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval);
  }, []);
  if (!conversation) {
    return null;
  }
  
  const isOnline = onlineUsers.has(otherUser.id) || otherUser.isOnline;

  return (
    <Card className="chat-window h-100">
      {/* Chat Header */}
      <Card.Header className="chat-header">
        <div className="d-flex align-items-center">
          <div className="user-avatar me-3">
            <img
              src={otherUser.avatar || '/default-avatar.png'}
              alt={otherUser.name}
              className="avatar-img"
            />
            {isOnline && <div className="online-indicator"></div>}
          </div>          <div className="user-info flex-grow-1">
            <h6 className="mb-0 d-flex align-items-center">
              {otherUser.name}
              <BlockStatusIndicator userId={otherUser.id} variant="badge" className="ms-2" />
            </h6>
            <small className={`status ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Đang hoạt động' : getOfflineTime(otherUser.lastActive)}
            </small>
          </div>          {/* Action Icons */}
          <div className="chat-actions d-flex align-items-center">
            <Button 
              variant="link" 
              className="text-muted p-2 me-1 action-btn" 
              title="Gọi thoại"
              onClick={() => {
                // TODO: Implement voice call
                console.log('Voice call feature coming soon...');
              }}
            >
              <i className="bi bi-telephone"></i>
            </Button>
            
            <Button 
              variant="link" 
              className="text-muted p-2 me-1 action-btn" 
              title="Gọi video"
              onClick={() => {
                // TODO: Implement video call
                console.log('Video call feature coming soon...');
              }}
            >
              <i className="bi bi-camera-video"></i>
            </Button>

            <Dropdown>
              <Dropdown.Toggle 
                variant="link" 
                className="text-muted p-2 action-btn"
                title="Cài đặt"
              >
                <i className="bi bi-three-dots-vertical"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href={`/profile/${otherUser.id}`}>
                  <i className="bi bi-person me-2"></i>
                  Xem hồ sơ
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as="div" className="p-0">
                  <div className="px-3 py-2">
                    <BlockUserButton
                      userId={otherUser.id}
                      userName={otherUser.name}
                      variant="minimal"
                      size="small"
                      showConfirmDialog={true}
                    />
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="text-danger">
                  <i className="bi bi-trash me-2"></i>
                  Xóa cuộc trò chuyện
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Card.Header>

      {/* Messages Area */}
      <Card.Body className="messages-container p-0">
        {loading && page === 1 ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>        ) : (          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
            onReply={handleReplyToMessage}
            onReactionToggle={handleReactionToggle}
            onScrollToMessage={scrollToMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
        <div ref={messagesEndRef} />
      </Card.Body>

      {/* Reply Preview */}
      {replyToMessage && (
        <div className="reply-preview">
          <div className="reply-content">            <small className="text-muted">
              Đang trả lời {replyToMessage.senderName}:
            </small>
            <div className="reply-message">
              {replyToMessage.content}
            </div>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-muted p-0"
            onClick={cancelReply}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      )}      {/* Message Input */}
      <Card.Footer className="message-input-container p-0">
        {!canCommunicate ? (
          <div className="blocked-message-container">
            <Alert variant="warning" className="mb-0 mx-3 my-2">
              {status.areMutuallyBlocking ? (
                <>
                  <div className="d-flex align-items-center">
                    <BlockStatusIndicator userId={otherUser.id} variant="minimal" />
                    <span className="ms-2">Cả hai đều đã chặn nhau. Không thể nhắn tin.</span>
                  </div>
                </>
              ) : status.isBlockedBy ? (
                <>
                  <div className="d-flex align-items-center">
                    <BlockStatusIndicator userId={otherUser.id} variant="minimal" />
                    <span className="ms-2">Bạn đã bị {otherUser.name} chặn. Không thể nhắn tin.</span>
                  </div>
                </>
              ) : status.isBlocked ? (
                <>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <BlockStatusIndicator userId={otherUser.id} variant="minimal" />
                      <span className="ms-2">Bạn đã chặn {otherUser.name}.</span>
                    </div>
                    <BlockUserButton
                      userId={otherUser.id}
                      userName={otherUser.name}
                      variant="minimal"
                      size="small"
                    />
                  </div>
                </>
              ) : null}
            </Alert>
          </div>
        ) : (
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!conversation || !canCommunicate}
            placeholder={`Nhắn tin cho ${otherUser.name}...`}
            conversationId={conversation?.id}
            replyToMessage={replyToMessage}
          />
        )}
      </Card.Footer>
    </Card>
  );
};

export default ChatWindow;
