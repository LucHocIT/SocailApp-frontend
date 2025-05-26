import React, { useState, useRef, useEffect } from 'react';
import { Overlay, Popover, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaThumbsUp } from 'react-icons/fa';
import postService from '../../services/postService';
import usePostReactions from '../../hooks/usePostReactions';
import styles from './styles/PostReactionButton.module.scss';

const PostReactionButton = ({ postId, onShowUsers, onReactionChange }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [animatingReaction, setAnimatingReaction] = useState(null);
  const [persistedReaction, setPersistedReaction] = useState(null);
  const target = useRef(null);
  const timeoutRef = useRef(null);
  
  const { 
    loading,
    currentReaction, 
    totalReactions, 
    handleReaction,
    removeReaction
  } = usePostReactions(postId);

  // Available reaction types with enhanced emojis
  const reactionTypes = [
    { name: 'like', emoji: '👍', label: 'Thích', color: '#1877f2' },
    { name: 'love', emoji: '❤️', label: 'Yêu thích', color: '#e74c3c' },
    { name: 'haha', emoji: '😆', label: 'Haha', color: '#f39c12' },
    { name: 'wow', emoji: '😮', label: 'Wow', color: '#f39c12' },
    { name: 'sad', emoji: '😢', label: 'Buồn', color: '#f39c12' },
    { name: 'angry', emoji: '😠', label: 'Tức giận', color: '#e74c3c' }
  ];

  // Update persisted reaction when current reaction changes
  useEffect(() => {
    setPersistedReaction(currentReaction);
  }, [currentReaction]);

  // Handle enhanced reaction logic with persistence and switching
  const handleReactionClick = async (type) => {
    try {
      setAnimatingReaction(type);
      
      // Enhanced switching logic
      let result;
      if (currentReaction === type) {
        // If clicking the same reaction, remove it
        result = await removeReaction();
      } else {
        // If clicking different reaction, switch to it
        result = await handleReaction({ reactionType: type });
      }
      
      if (!result.success && result.message) {
        toast.error(result.message);
      } else {
        // Update persisted state on success
        const newReaction = currentReaction === type ? null : type;
        setPersistedReaction(newReaction);
        
        // Notify parent component if provided
        if (onReactionChange) {
          onReactionChange(newReaction);
        }
      }
      
      setShowReactions(false);
      
      // Clear animation after delay
      timeoutRef.current = setTimeout(() => {
        setAnimatingReaction(null);
      }, 600);      
    } catch (error) {
      // Revert to persisted state on error
      if (persistedReaction !== currentReaction) {
        // Could add rollback logic here if needed
      }
      toast.error('Không thể thả cảm xúc: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Handle showing reactions with enhanced logic
  const handleShowReactions = () => {
    if (currentReaction) {
      // If user has reacted, toggle the reaction
      handleReactionClick(currentReaction);
    } else {
      // If no reaction, show reaction picker
      setShowReactions(!showReactions);
    }
  };

  // Handle long press for reaction picker (mobile)
  const handleLongPress = () => {
    setShowReactions(true);
  };

  // Handle reaction count click to show users modal
  const handleReactionCountClick = (e) => {
    e.stopPropagation();
    if (totalReactions > 0 && onShowUsers) {
      onShowUsers();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get current reaction details
  const getCurrentReaction = () => {
    return reactionTypes.find(r => r.name === currentReaction);
  };  
  return (
    <div className={styles.reactionContainer}>
      <Button
        ref={target}
        variant="link"
        size="sm"
        className={`${styles.reactionButton} ${currentReaction ? styles.hasReacted : ''}`}
        onClick={handleShowReactions}
        onDoubleClick={() => handleReactionClick('like')}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
        disabled={loading}
        style={{
          color: currentReaction ? getCurrentReaction()?.color : undefined
        }}
      >
        {currentReaction ? (
          <span className={`${styles.reactionDisplay} ${animatingReaction === currentReaction ? styles.animating : ''}`}>
            {postService.getReactionEmoji(currentReaction)} 
            <span className={styles.reactionLabel}>
              {getCurrentReaction()?.label || currentReaction.charAt(0).toUpperCase() + currentReaction.slice(1)}
            </span>
          </span>
        ) : (
          <span className={styles.defaultReaction}>
            <FaThumbsUp /> Thích
          </span>
        )}
      </Button>

      {/* Reaction count display */}
      {totalReactions > 0 && (
        <span 
          className={styles.reactionCount}
          onClick={handleReactionCountClick}
        >
          {loading ? '...' : totalReactions}
        </span>
      )}

      <Overlay
        target={target.current}
        show={showReactions && !loading}
        placement="top"
        rootClose
        onHide={() => setShowReactions(false)}
      >
        <Popover className={styles.reactionPopover}>
          <Popover.Body className={styles.reactionPopoverBody}>
            {reactionTypes.map((reaction) => (
              <Button
                key={reaction.name}
                variant="link"
                className={`${styles.reactionOption} ${currentReaction === reaction.name ? styles.selected : ''}`}
                onClick={() => handleReactionClick(reaction.name)}
                disabled={loading}
                title={reaction.label}
              >
                <span className={styles.reactionEmoji}>
                  {reaction.emoji}
                </span>
                <span className={styles.reactionTooltip}>
                  {reaction.label}
                </span>
              </Button>
            ))}
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default PostReactionButton;
