import React from 'react';
import { ListGroup, Badge, Spinner } from 'react-bootstrap';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/hooks';
import TimeAgo from 'react-timeago';
import styles from './ChatRoomList.module.scss';

function ChatRoomList({ chatRooms, isLoading, currentChat }) {
  const { selectChat, unreadCounts } = useChat();
  const { user } = useAuth();

  const handleChatSelect = (chatRoom) => {
    selectChat(chatRoom);
  };

  const getChatRoomDisplayName = (chatRoom) => {
    if (chatRoom.type === 0) { // Private chat
      const otherMember = chatRoom.members?.find(m => m.userId !== user.id);
      return otherMember ? `${otherMember.user.firstName} ${otherMember.user.lastName}` : 'Unknown User';
    }
    return chatRoom.name;
  };

  const getChatRoomAvatar = (chatRoom) => {
    if (chatRoom.type === 0) { // Private chat
      const otherMember = chatRoom.members?.find(m => m.userId !== user.id);
      return otherMember?.user.profilePictureUrl || '/default-avatar.png';
    }
    return '/group-chat-avatar.png';
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (!content) return '';
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }
  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="text-center p-4 text-muted">
        <i className="fas fa-inbox fa-2x mb-3"></i>
        <p className="mb-2">No conversations yet</p>
        <small className="text-muted mb-3 d-block">Start a new chat to begin messaging</small>
        <p className="small">
          <i className="fas fa-lightbulb me-1"></i>
          Click the <strong>"New Chat"</strong> or <strong>"Group"</strong> buttons above to get started!
        </p>
      </div>
    );
  }

  return (
    <ListGroup variant="flush" className={styles.chatRoomList}>
      {chatRooms.map((chatRoom) => {
        const isActive = currentChat?.id === chatRoom.id;
        const unreadCount = unreadCounts[chatRoom.id] || 0;
        const displayName = getChatRoomDisplayName(chatRoom);
        const avatarUrl = getChatRoomAvatar(chatRoom);

        return (
          <ListGroup.Item
            key={chatRoom.id}
            className={`${styles.chatRoomItem} ${isActive ? styles.active : ''}`}
            onClick={() => handleChatSelect(chatRoom)}
            action
          >
            <div className={styles.chatRoomContent}>
              {/* Avatar */}
              <div className={styles.avatar}>
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                {chatRoom.type === 0 && (
                  <div className={styles.onlineIndicator}>
                    {/* You can add online status logic here */}
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <h6 className={styles.chatName}>{displayName}</h6>
                  <div className={styles.chatMeta}>
                    {chatRoom.lastMessage && (
                      <small className={styles.lastMessageTime}>
                        <TimeAgo date={chatRoom.lastMessage.sentAt} />
                      </small>
                    )}
                    {unreadCount > 0 && (
                      <Badge bg="primary" className={styles.unreadBadge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Last Message */}
                {chatRoom.lastMessage && (
                  <div className={styles.lastMessage}>
                    <span className={styles.senderName}>
                      {chatRoom.lastMessage.sender.id === user.id 
                        ? 'You' 
                        : chatRoom.lastMessage.sender.firstName
                      }:
                    </span>
                    <span className={styles.messageContent}>
                      {chatRoom.lastMessage.messageType === 1 ? ( // Image
                        <><i className="fas fa-image"></i> Photo</>
                      ) : chatRoom.lastMessage.messageType === 2 ? ( // File
                        <><i className="fas fa-file"></i> File</>
                      ) : (
                        truncateMessage(chatRoom.lastMessage.content)
                      )}
                    </span>
                  </div>
                )}

                {/* Chat Type Indicator */}
                {chatRoom.type === 1 && ( // Group chat
                  <div className={styles.groupIndicator}>
                    <i className="fas fa-users"></i>
                    <small>{chatRoom.members?.length || 0} members</small>
                  </div>
                )}
              </div>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}

export default ChatRoomList;
