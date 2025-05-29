import React, { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ReactionUsersModal from './ReactionUsersModal';
import postService from '../../../services/postService';
import styles from '../styles/PostReactionStack.module.scss';

const PostReactionStack = ({ 
  postId, 
  reactionCounts, 
  maxVisible = 3,
  onClick 
}) => {
  const [showModal, setShowModal] = useState(false);
  // Filter out reactions with count = 0 and get unique reaction types
  const validReactions = Object.entries(reactionCounts || {})
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  if (validReactions.length === 0) {
    return null;
  }

  // Get unique reaction types (no duplicates, just unique emojis)
  const uniqueReactions = validReactions.slice(0, maxVisible);
  const totalCount = validReactions.reduce((sum, [, count]) => sum + count, 0);

  // Create tooltip content
  const getTooltipContent = () => {
    const reactionSummary = validReactions
      .map(([type, count]) => `${postService.getReactionEmoji(type)} ${count}`)
      .join(', ');
    return `${totalCount} reactions: ${reactionSummary}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{getTooltipContent()}</Tooltip>}
      >        <div className={styles.reactionStack} onClick={handleClick}>
          <div 
            className={styles.reactionEmojis}
            style={{ 
              width: `${Math.max(18, uniqueReactions.length * 8 + 10)}px` 
            }}
          >
            {uniqueReactions.map(([type], index) => (
              <span 
                key={type}
                className={styles.reactionEmoji}
                style={{ 
                  zIndex: uniqueReactions.length - index,
                  left: `${index * 8}px`
                }}
              >
                {postService.getReactionEmoji(type)}
              </span>
            ))}
          </div>
          <span className={styles.reactionCount}>
            {totalCount}
          </span>
        </div>
      </OverlayTrigger>

      {showModal && (
        <ReactionUsersModal
          show={showModal}
          onHide={() => setShowModal(false)}
          postId={postId}
        />
      )}
    </>
  );
};

export default PostReactionStack;
