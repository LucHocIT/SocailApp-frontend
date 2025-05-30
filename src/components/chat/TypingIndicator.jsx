import React from 'react';
import styles from './TypingIndicator.module.scss';

function TypingIndicator({ typingUsers, currentUser }) {
  // Filter out current user from typing users
  const otherTypingUsers = typingUsers.filter(user => user.userId !== currentUser.id);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    const userNames = otherTypingUsers.map(user => user.username || 'Someone');
    
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`;
    } else if (userNames.length > 2) {
      return `${userNames[0]}, ${userNames[1]} and ${userNames.length - 2} others are typing...`;
    }
    
    return '';
  };

  return (
    <div className={styles.typingIndicator}>
      <div className={styles.typingContent}>
        <div className={styles.typingAnimation}>
          <div className={styles.typingDot}></div>
          <div className={styles.typingDot}></div>
          <div className={styles.typingDot}></div>
        </div>
        <span className={styles.typingText}>
          {getTypingText()}
        </span>
      </div>
    </div>
  );
}

export default TypingIndicator;
