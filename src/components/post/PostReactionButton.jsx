import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { reactionAnimationProps } from '../../utils/animationHelpers';
import postService from '../../services/postService';
import usePostReactions from '../../hooks/usePostReactions';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const PostReactionButton = ({ postId }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [hoveringReaction, setHoveringReaction] = useState(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);
  
  const { 
    loading,
    currentReaction, 
    totalReactions, 
    handleReaction 
  } = usePostReactions(postId);
  
  const reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const handleReactionSelect = async (type) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowReactions(false);
    
    const result = await handleReaction({ reactionType: type });
    if (!result.success && result.message) {
      toast.error(result.message);
    }
  };
    const handleButtonClick = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (currentReaction) {
      await handleReaction({ reactionType: currentReaction });
    } else {
      await handleReaction({ reactionType: 'love' });
    }
  };
    const animProps = reactionAnimationProps({
    type: currentReaction || 'love',
    isActive: !!currentReaction
  });

  const getReactionLabel = (type) => {
    const labels = {
      like: 'Thích',
      love: 'Yêu thích',
      haha: 'Haha',
      wow: 'Wow',
      sad: 'Buồn',
      angry: 'Phẫn nộ'
    };
    return labels[type] || 'Thích';
  };
  
  return (
    <div className="reaction-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div ref={buttonRef} className="reaction-button-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="reaction-button"
          onClick={handleButtonClick}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setShowReactions(true);
          }}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => {
              const selectorElement = document.querySelector('.reaction-selector');
              if (selectorElement && !selectorElement.matches(':hover')) {
                setShowReactions(false);
              }
            }, 300);
          }}
          style={{
            ...animProps.style,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderRadius: '20px',
            transition: 'all 0.2s ease',
            background: currentReaction ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
            fontWeight: currentReaction ? 600 : 400,
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        >          {currentReaction ? (
            <>
              <span 
                className="reaction-emoji heartbeat"
                style={{ 
                  fontSize: '1.2rem', 
                  marginRight: '4px',
                  animation: 'heartbeat 1.2s ease-in-out',
                }}
              >
                {currentReaction === 'love' ? (
                  <FaHeart color="var(--red-color)" />
                ) : (
                  postService.getReactionEmoji(currentReaction)
                )}
              </span>
              <span className="reaction-text" style={{ color: currentReaction === 'love' ? 'var(--red-color)' : 'inherit' }}>
                {getReactionLabel(currentReaction)}
              </span>
            </>
          ) : (
            <>              <FaRegHeart 
                className="reaction-emoji"  
                style={{ 
                  fontSize: '1.2rem', 
                  marginRight: '4px',
                  color: 'var(--text-muted)' 
                }}
              />
              <span className="reaction-text">Thích</span>
            </>
          )}
        </div>
        
        <AnimatePresence>
          {showReactions && (
            <div
              className="reaction-selector"
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onMouseLeave={() => {
                setShowReactions(false);
                setHoveringReaction(null);
              }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                padding: '8px',
                borderRadius: '40px',
                background: 'var(--card-bg)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                gap: '8px',
                marginBottom: '8px',
                zIndex: 100,
                animation: 'fadeInUp 0.3s forwards',
              }}
            >
              {reactionTypes.map((type) => (
                <button
                  key={type}
                  className={`reaction-icon-button ${currentReaction === type ? 'active-reaction' : ''}`}
                  onClick={() => handleReactionSelect(type)}
                  onMouseEnter={() => setHoveringReaction(type)}
                  onMouseLeave={() => setHoveringReaction(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    padding: '6px',
                    transform: currentReaction === type ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: currentReaction === type ? '0 0 0 2px var(--primary-color)' : 'none',
                    borderRadius: '50%',
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    willChange: 'transform',
                    '&:hover': {
                      transform: 'scale(1.3) translateY(-5px)'
                    }
                  }}
                  aria-label={getReactionLabel(type)}
                >
                  {postService.getReactionEmoji(type)}
                  
                  {hoveringReaction === type && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        zIndex: 101,
                        animation: 'fadeIn 0.2s forwards'
                      }}
                    >
                      {getReactionLabel(type)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {totalReactions > 0 && (
        <span 
          className="reaction-count"
          style={{ 
            fontSize: '0.875rem', 
            marginLeft: '8px',
            fontWeight: '500',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.05)',
            padding: '2px 8px',
            borderRadius: '10px',
          }}
        >
          {loading ? '...' : totalReactions}
        </span>
      )}
        <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .reaction-icon-button:hover {
          transform: scale(1.3) translateY(-5px);
        }
          .reaction-button:hover .reaction-emoji {
          transform: scale(1.2);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default PostReactionButton;
