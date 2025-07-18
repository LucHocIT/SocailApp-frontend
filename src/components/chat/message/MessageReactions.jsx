import React, { useState } from 'react';
import { REACTION_EMOJIS } from '../../../constants/reactions';
import styles from './MessageReactions.module.scss';

const MessageReactions = ({ 
  reactionCounts = {}, 
  hasReactedByCurrentUser = false,
  currentUserReactionType = null,
  onReactionClick,
  onReactionHover,
  onReactionLeave,
  isOwnMessage = false
}) => {
  const [hoveredReaction, setHoveredReaction] = useState(null);
  // Filter out reactions with zero count
  const activeReactions = Object.entries(reactionCounts).filter(([, count]) => count > 0);

  if (activeReactions.length === 0) {
    return null;
  }

  const handleReactionClick = (reactionType) => {
    if (onReactionClick) {
      onReactionClick(reactionType);
    }
  };

  const handleReactionMouseEnter = (reactionType) => {
    setHoveredReaction(reactionType);
    if (onReactionHover) {
      onReactionHover(reactionType);
    }
  };

  const handleReactionMouseLeave = () => {
    setHoveredReaction(null);
    if (onReactionLeave) {
      onReactionLeave();
    }
  };  return (
    <div className={`${styles.messageReactions} ${!isOwnMessage ? styles.leftAligned : ''}`}>
      {activeReactions.map(([reactionType, count]) => {
        // Get emoji - try lowercase first, then capitalized as fallback
        const emoji = REACTION_EMOJIS[reactionType.toLowerCase()] || REACTION_EMOJIS[reactionType] || '👍';
        const isUserReacted = hasReactedByCurrentUser && currentUserReactionType === reactionType;
        
        return (
          <button
            key={reactionType}
            type="button"
            className={`${styles.reactionBadge} ${
              isUserReacted ? styles.userReacted : ''
            } ${hoveredReaction === reactionType ? styles.hovered : ''}`}
            onClick={() => handleReactionClick(reactionType)}
            onMouseEnter={() => handleReactionMouseEnter(reactionType)}
            onMouseLeave={handleReactionMouseLeave}
            title={`${reactionType} (${count})`}          >
            <span className={styles.emoji}>{emoji}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MessageReactions;


