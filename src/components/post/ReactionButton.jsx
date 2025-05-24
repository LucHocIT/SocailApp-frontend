import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  reactionAnimationProps
} from '../../utils/animationHelpers';
import { getReactionEmoji } from '../../services/postService';

const ReactionButton = ({ 
  postId, 
  commentId, 
  initialReaction, 
  onReact,
  totalReactions = 0
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(initialReaction);
  const buttonRef = useRef(null);
  
  // Available reaction types
  const reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
  
  const handleReactionSelect = (type) => {
    setShowReactions(false);
    
    // Don't do anything if same reaction is selected
    if (currentReaction === type) return;
    
    // Set the new reaction
    setCurrentReaction(type);
    
    // Call the parent handler
    if (onReact) {
      onReact({
        postId, 
        commentId,
        reactionType: type
      });
    }
  };
  
  const handleButtonClick = () => {
    if (currentReaction) {
      // If already reacted, remove reaction
      setCurrentReaction(null);
      if (onReact) {
        onReact({
          postId,
          commentId,
          reactionType: null
        });
      }
    } else {
      // Default reaction on simple click is 'like'
      setCurrentReaction('like');
      if (onReact) {
        onReact({
          postId,
          commentId,
          reactionType: 'like'
        });
      }
    }
  };
  
  // Get animation props based on current reaction
  const animProps = reactionAnimationProps({
    type: currentReaction || 'like',
    isActive: !!currentReaction
  });

  return (
    <div className="reaction-container" style={{ position: 'relative' }}>
      <div 
        ref={buttonRef}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        className="reaction-button-wrapper"
      >
        <div
          className="reaction-button"
          onClick={handleButtonClick}
          onMouseEnter={() => setShowReactions(true)}
          style={{
            ...animProps.style,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          {currentReaction ? (
            <>
              {getReactionEmoji(currentReaction)}
              <span className="reaction-text ml-1">
                {currentReaction.charAt(0).toUpperCase() + currentReaction.slice(1)}
              </span>
            </>
          ) : (
            <>
              👍
              <span className="reaction-text ml-1">Like</span>
            </>
          )}
        </div>
        
        {/* Reaction selector popup */}
        <AnimatePresence>
          {showReactions && (
            <div
              className="reaction-selector"
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                padding: '8px',
                borderRadius: '40px',
                background: 'var(--card-bg)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                display: 'flex',
                gap: '8px',
                marginBottom: '8px',
                zIndex: 10
              }}
            >              {reactionTypes.map((type) => (
                <button
                  key={type}
                  className="reaction-icon-button"
                  onClick={() => handleReactionSelect(type)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  aria-label={type}
                >
                  {getReactionEmoji(type)}
                </button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Reaction counter */}
      {totalReactions > 0 && (
        <span 
          className="reaction-count"
          style={{ 
            fontSize: '0.875rem', 
            marginLeft: '4px',
            color: 'var(--text-muted)'
          }}
        >
          {totalReactions}
        </span>
      )}
    </div>
  );
};

export default ReactionButton;
