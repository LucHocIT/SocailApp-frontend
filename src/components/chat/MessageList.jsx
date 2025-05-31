import React, { useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Message from './Message';
import './MessageList.scss';

const MessageList = ({ 
  messages, 
  currentUserId, 
  onLoadMore, 
  hasMore, 
  loading, 
  onReply 
}) => {
  const scrollRef = useRef(null);
  const prevScrollHeight = useRef(0);

  useEffect(() => {
    if (scrollRef.current && loading && hasMore) {
      // Maintain scroll position when loading more messages
      const scrollContainer = scrollRef.current;
      const newScrollHeight = scrollContainer.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeight.current;
      scrollContainer.scrollTop += heightDifference;
      prevScrollHeight.current = newScrollHeight;
    }
  }, [messages, loading, hasMore]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop } = scrollRef.current;
      if (scrollTop === 0 && hasMore && !loading) {
        prevScrollHeight.current = scrollRef.current.scrollHeight;
        onLoadMore();
      }
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.sentAt).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateString === today) {
      return 'Hôm nay';
    } else if (dateString === yesterday) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div 
      className="message-list" 
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {/* Load More Button */}
      {hasMore && (
        <div className="load-more-container">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={onLoadMore}
              className="load-more-btn"
            >
              Tải thêm tin nhắn
            </Button>
          )}
        </div>
      )}

      {/* Messages grouped by date */}
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="message-group">
          {/* Date separator */}
          <div className="date-separator">
            <span className="date-label">
              {formatDateHeader(group.date)}
            </span>
          </div>

          {/* Messages for this date */}
          {group.messages.map((message, messageIndex) => {
            const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null;
            const nextMessage = messageIndex < group.messages.length - 1 ? group.messages[messageIndex + 1] : null;
            
            const isFromSameSender = prevMessage?.senderId === message.senderId;
            const isFollowedBySameSender = nextMessage?.senderId === message.senderId;
            
            const timeDiff = prevMessage 
              ? new Date(message.sentAt) - new Date(prevMessage.sentAt)
              : Infinity;
            
            const showAvatar = !isFromSameSender || timeDiff > 300000; // 5 minutes
            const isFirstInGroup = !isFromSameSender || timeDiff > 300000;
            const isLastInGroup = !isFollowedBySameSender || 
              (nextMessage && new Date(nextMessage.sentAt) - new Date(message.sentAt) > 300000);

            return (
              <Message
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                showAvatar={showAvatar}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                onReply={onReply}
              />
            );
          })}
        </div>
      ))}

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="empty-messages">
          <div className="text-center p-4">
            <i className="bi bi-chat-dots text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mt-3">Chưa có tin nhắn nào</p>
            <p className="text-muted">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
