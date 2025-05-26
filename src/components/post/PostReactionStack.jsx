import React, { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ReactionUsersModal from './ReactionUsersModal';
import postService from '../../services/postService';
import styles from './styles/PostReactionStack.module.scss';

const PostReactionStack = ({ 
  postId, 
  reactionCounts, 
  maxVisible = 3,
  onClick 
}) => {
  const [showModal, setShowModal] = useState(false);

  // Filter out reactions with count = 0 and sort by count descending
  const validReactions = Object.entries(reactionCounts || {})
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  if (validReactions.length === 0) {
    return null;
  }

  // Get top reactions to display
  const displayReactions = validReactions.slice(0, maxVisible);
  const remainingCount = validReactions.length - maxVisible;
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
      >
        <div className={styles.reactionStack} onClick={handleClick}>
          <div className={styles.reactionEmojis}>
            {displayReactions.map(([type], index) => (
              <span 
                key={type}
                className={styles.reactionEmoji}
                style={{ 
                  zIndex: displayReactions.length - index,
                  left: `${index * 12}px`
                }}
              >
                {postService.getReactionEmoji(type)}
              </span>
            ))}
            {remainingCount > 0 && (
              <span 
                className={styles.moreIndicator}
                style={{ 
                  left: `${maxVisible * 12}px`,
                  zIndex: 0
                }}
              >
                +{remainingCount}
              </span>
            )}
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
