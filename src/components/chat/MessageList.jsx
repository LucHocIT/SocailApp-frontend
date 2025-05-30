import React from 'react';
import { Dropdown } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import signalRService from '../../services/signalRService';
import styles from './MessageList.module.scss';

function MessageList({ messages, currentUser, onReply }) {
  const handleReaction = async (messageId, reactionType) => {
    try {
      await signalRService.addReaction(messageId, reactionType);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleReply = (message) => {
    onReply(message);
  };

  const isOwnMessage = (message) => {
    return message.senderId === currentUser.id;
  };

  const formatMessageTime = (sentAt) => {
    const messageDate = new Date(sentAt);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const renderMessageContent = (message) => {
    if (message.messageType === 1) { // Image
      return (
        <div className={styles.messageImage}>
          <img 
            src={message.attachmentUrl} 
            alt={message.attachmentName || 'Image'}
            onClick={() => window.open(message.attachmentUrl, '_blank')}
          />
          {message.content && (
            <div className={styles.imageCaption}>{message.content}</div>
          )}
        </div>
      );
    } else if (message.messageType === 2) { // File
      return (
        <div className={styles.messageFile}>
          <a 
            href={message.attachmentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.fileLink}
          >
            <i className="fas fa-file"></i>
            <span>{message.attachmentName || 'File'}</span>
            <i className="fas fa-download"></i>
          </a>
          {message.content && (
            <div className={styles.fileCaption}>{message.content}</div>
          )}
        </div>
      );
    } else {
      // Text message
      return (
        <div className={styles.messageText}>
          {message.content}
        </div>
      );
    }
  };

  const renderReactions = (message) => {
    if (!message.reactions || message.reactions.length === 0) return null;

    // Group reactions by type
    const reactionGroups = message.reactions.reduce((groups, reaction) => {
      if (!groups[reaction.reactionType]) {
        groups[reaction.reactionType] = [];
      }
      groups[reaction.reactionType].push(reaction);
      return groups;
    }, {});

    return (
      <div className={styles.messageReactions}>
        {Object.entries(reactionGroups).map(([reactionType, reactions]) => (
          <button
            key={reactionType}
            className={`${styles.reactionButton} ${
              reactions.some(r => r.userId === currentUser.id) ? styles.userReacted : ''
            }`}
            onClick={() => handleReaction(message.id, reactionType)}
            title={reactions.map(r => r.user.firstName).join(', ')}
          >
            <span className={styles.reactionEmoji}>{reactionType}</span>
            <span className={styles.reactionCount}>{reactions.length}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderReplyMessage = (replyToMessage) => {
    if (!replyToMessage) return null;

    return (
      <div className={styles.replyToMessage}>
        <div className={styles.replyAuthor}>
          {replyToMessage.sender.firstName}
        </div>
        <div className={styles.replyContent}>
          {replyToMessage.messageType === 1 ? (
            <><i className="fas fa-image"></i> Photo</>
          ) : replyToMessage.messageType === 2 ? (
            <><i className="fas fa-file"></i> File</>
          ) : (
            replyToMessage.content
          )}
        </div>
      </div>
    );
  };

  if (!messages || messages.length === 0) {
    return (
      <div className={styles.emptyMessages}>
        <i className="fas fa-comments fa-3x"></i>
        <h5>No messages yet</h5>
        <p>Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <div className={styles.messageList}>
      {messages.map((message, index) => {
        const isOwn = isOwnMessage(message);
        const showAvatar = !isOwn && (
          index === 0 || 
          messages[index - 1].senderId !== message.senderId ||
          new Date(message.sentAt) - new Date(messages[index - 1].sentAt) > 5 * 60 * 1000 // 5 minutes
        );
        const showTimestamp = (
          index === 0 ||
          new Date(message.sentAt) - new Date(messages[index - 1].sentAt) > 5 * 60 * 1000 // 5 minutes
        );

        return (
          <div key={message.id} className={styles.messageWrapper}>
            {/* Timestamp */}
            {showTimestamp && (
              <div className={styles.messageTimestamp}>
                <TimeAgo date={message.sentAt} />
              </div>
            )}

            {/* Message */}
            <div className={`${styles.messageContainer} ${isOwn ? styles.ownMessage : styles.otherMessage}`}>
              {/* Avatar */}
              {!isOwn && (
                <div className={styles.messageAvatar}>
                  {showAvatar ? (                    <img 
                      src={message.sender.profilePictureUrl || '/default-avatar.svg'} 
                      alt={message.sender.firstName}
                      onError={(e) => {
                        e.target.src = '/default-avatar.svg';
                      }}
                    />
                  ) : (
                    <div className={styles.avatarSpacer}></div>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className={styles.messageContent}>
                {/* Sender name for group chats */}
                {!isOwn && showAvatar && (
                  <div className={styles.senderName}>
                    {message.sender.firstName} {message.sender.lastName}
                  </div>
                )}

                {/* Reply to message */}
                {message.replyToMessage && renderReplyMessage(message.replyToMessage)}                {/* Message bubble */}
                <div className={styles.messageBubble}>
                  {renderMessageContent(message)}
                  
                  {/* Message info */}
                  <div className={styles.messageInfo}>
                    <span className={styles.messageTime}>
                      {formatMessageTime(message.sentAt)}
                    </span>
                    {message.editedAt && (
                      <span className={styles.editedIndicator}>edited</span>
                    )}
                    {isOwn && (
                      <div className={styles.messageStatus}>
                        {message.readStatuses && message.readStatuses.length > 0 ? (
                          <i className="fas fa-check-double text-primary"></i>
                        ) : (
                          <i className="fas fa-check"></i>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message actions dropdown */}
                  <Dropdown className={styles.messageActions}>
                    <Dropdown.Toggle variant="link" size="sm">
                      <i className="fas fa-ellipsis-v"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleReply(message)}>
                        <i className="fas fa-reply me-2"></i>Reply
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleReaction(message.id, '👍')}>
                        <i className="fas fa-thumbs-up me-2"></i>React
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <i className="fas fa-copy me-2"></i>Copy
                      </Dropdown.Item>
                      {isOwn && (
                        <>
                          <Dropdown.Divider />
                          <Dropdown.Item>
                            <i className="fas fa-edit me-2"></i>Edit
                          </Dropdown.Item>
                          <Dropdown.Item className="text-danger">
                            <i className="fas fa-trash me-2"></i>Delete
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* Reactions */}
                {renderReactions(message)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MessageList;
