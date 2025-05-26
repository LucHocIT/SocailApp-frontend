import React, { useState, useRef, useEffect } from 'react';
import { Overlay, Popover, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaHeart, FaThumbsUp } from 'react-icons/fa';
import { useAuth } from '../../context/hooks';
import commentService from '../../services/commentService';
import styles from './styles/CommentReactionButton.module.scss';

const CommentReactionButton = ({ commentId, currentReaction, onReactionChange }) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(currentReaction);
  const [animatingReaction, setAnimatingReaction] = useState(null);
  const [persistedReaction, setPersistedReaction] = useState(currentReaction);
  const target = useRef(null);
  const timeoutRef = useRef(null);

  // Available reaction types with enhanced emojis
  const reactionTypes = [
    { name: 'like', emoji: '👍', label: 'Thích', color: '#1877f2' },
    { name: 'love', emoji: '❤️', label: 'Yêu thích', color: '#e74c3c' },
    { name: 'haha', emoji: '😆', label: 'Haha', color: '#f39c12' },
    { name: 'wow', emoji: '😮', label: 'Wow', color: '#f39c12' },
    { name: 'sad', emoji: '😢', label: 'Buồn', color: '#f39c12' },
    { name: 'angry', emoji: '😠', label: 'Tức giận', color: '#e74c3c' }
  ];
  // Update selected reaction when prop changes and persist state
  useEffect(() => {
    setSelectedReaction(currentReaction);
    setPersistedReaction(currentReaction);
  }, [currentReaction]);

  // Handle reaction click with improved switching logic
  const handleReaction = async (type) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để thả cảm xúc');
      setShowReactions(false);
      return;
    }

    try {
      setLoading(true);
      setAnimatingReaction(type);
      
      // Improved reaction switching logic
      let newReaction;
      if (selectedReaction === type) {
        // If clicking the same reaction, remove it
        newReaction = null;
      } else {
        // If clicking different reaction, switch to it
        newReaction = type;
      }
      
      // Optimistic update
      setSelectedReaction(newReaction);
      setPersistedReaction(newReaction);
      
      // Send reaction to API
      await commentService.addReaction({
        commentId: commentId,
        reactionType: type
      });
      
      // Notify parent component
      if (onReactionChange) {
        onReactionChange(newReaction);
      }
      
      setShowReactions(false);
      
      // Clear animation after delay
      timeoutRef.current = setTimeout(() => {
        setAnimatingReaction(null);
      }, 600);
      
    } catch (error) {
      // Revert optimistic update on error
      setSelectedReaction(persistedReaction);
      toast.error('Không thể thả cảm xúc: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };  // Handle showing reactions with persisted state and smooth transitions
  const handleShowReactions = () => {
    if (selectedReaction) {
      // If user has reacted, toggle the reaction (remove it)
      handleReaction(selectedReaction);
    } else {
      // If no reaction, show reaction picker
      setShowReactions(!showReactions);
    }
  };

  // Handle long press for reaction picker (on mobile)
  const handleLongPress = () => {
    setShowReactions(true);
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
    return reactionTypes.find(r => r.name === selectedReaction);
  };
  return (
    <div className={styles.reactionContainer}>
      <Button
        ref={target}
        variant="link"
        size="sm"
        className={`${styles.reactionButton} ${selectedReaction ? styles.hasReacted : ''}`}        onClick={handleShowReactions}
        onDoubleClick={() => handleReaction('like')}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
        disabled={loading || !user}
        style={{
          color: selectedReaction ? getCurrentReaction()?.color : undefined
        }}
      >
        {selectedReaction ? (
          <span className={`${styles.reactionDisplay} ${animatingReaction === selectedReaction ? styles.animating : ''}`}>
            {commentService.getReactionEmoji(selectedReaction)} 
            <span className={styles.reactionLabel}>
              {getCurrentReaction()?.label || selectedReaction.charAt(0).toUpperCase() + selectedReaction.slice(1)}
            </span>
          </span>
        ) : (
          <span className={styles.defaultReaction}>
            <FaThumbsUp /> Thích
          </span>
        )}
      </Button>

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
                className={`${styles.reactionOption} ${selectedReaction === reaction.name ? styles.selected : ''}`}
                onClick={() => handleReaction(reaction.name)}
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

export default CommentReactionButton;
