import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { reactionAnimationProps } from '../../utils/animationHelpers';
import useCommentReactions from '../../hooks/useCommentReactions';
import commentService from '../../services/commentService';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import styles from './styles/ReactionButton.module.scss';

const CommentReactionButton = ({ commentId, onShowUsers, comment }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [hoveringReaction, setHoveringReaction] = useState(null);  
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);
    // Use local state for reaction counts to avoid dependency on the hook
  const [totalReactions, setTotalReactions] = useState(comment?.reactionsCount || 0);
  const [currentReaction, setCurrentReaction] = useState(comment?.currentUserReactionType || null);
  const [loading, setLoading] = useState(false);
  
  // Get minimal handlers from the hook
  const reactions = useCommentReactions(commentId);
  
  // Define local handlers
  const handleReaction = async (type) => {
    if (loading) return;
    
    setLoading(true);    try {
      // Use the hook's handler if available, otherwise implement a simple version
      if (reactions.handleReaction) {
        await reactions.handleReaction(type);
      } else {
        const result = await commentService.addReaction({
          commentId: commentId,
          reactionType: type
        });
        
        if (result) {
          // Update local state
          setCurrentReaction(type);
          setTotalReactions(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add reaction');
    } finally {
      setLoading(false);
    }
  };
  
  const removeReaction = async () => {
    if (loading || !currentReaction) return;
    
    setLoading(true);    try {
      // Use the hook's handler if available, otherwise implement a simple version
      if (reactions.removeReaction) {
        await reactions.removeReaction();
      } else {
        const result = await commentService.addReaction({
          commentId: commentId,
          reactionType: currentReaction // Toggling the same type removes it
        });
        
        if (result) {
          // Update local state
          setCurrentReaction(null);
          setTotalReactions(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove reaction');
    } finally {
      setLoading(false);
    }
  };
  
  const reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const handleReactionSelect = async (type) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowReactions(false);
    
    if (loading) return;
    
    try {
      await handleReaction(type);
    } catch (error) {
      toast.error(error.message || 'Failed to add reaction');
    }
  };
  
  const handleButtonClick = () => {
    if (currentReaction) {
      // If already reacted, clicking again removes the reaction
      removeReaction();
    } else {
      // Show reactions panel to select a reaction type
      setShowReactions(true);
    }
  };
  
  const handleButtonMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 300);
  };
  
  const handleButtonMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!hoveringReaction) {
        setShowReactions(false);
      }
    }, 300);
  };
  
  // Emoji mapping for reaction types
  const reactionEmojis = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠'
  };
  
  // Get current reaction emoji if any
  const currentReactionEmoji = currentReaction ? reactionEmojis[currentReaction] : null;
  
  return (
    <div 
      className={styles.reactionButtonContainer}
      ref={buttonRef}
    >
      {/* Main reaction button */}
      <button
        className={`${styles.reactionButton} ${currentReaction ? styles.hasReaction : ''}`}
        onClick={handleButtonClick}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        disabled={loading}
      >
        {currentReactionEmoji ? (
          <span>{currentReactionEmoji}</span>
        ) : (
          <FaRegHeart />
        )}
        {totalReactions > 0 && (
          <span 
            className={styles.reactionCount}
            onClick={(e) => {
              e.stopPropagation();
              onShowUsers && onShowUsers();
            }}
          >
            {totalReactions}
          </span>
        )}
      </button>
      
      {/* Reaction selector */}
      <AnimatePresence>
        {showReactions && (
          <div 
            className={styles.reactionSelector}
            onMouseEnter={() => setHoveringReaction(true)}
            onMouseLeave={() => {
              setHoveringReaction(false);
              setShowReactions(false);
            }}
            {...reactionAnimationProps}
          >
            {reactionTypes.map(type => (
              <button
                key={type}
                className={styles.reactionOption}
                onClick={() => handleReactionSelect(type)}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
              >
                {reactionEmojis[type]}
              </button>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentReactionButton;
