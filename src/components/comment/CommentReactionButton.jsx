import React, { useState, useRef } from 'react';
import { Overlay, Popover, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/hooks';
import commentService from '../../services/commentService';
import styles from './styles/CommentReactionButton.module.scss';

const CommentReactionButton = ({ commentId, currentReaction }) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);
  const [loading, setLoading] = useState(false);
  const target = useRef(null);

  // Available reaction types
  const reactionTypes = [
    { name: 'like', emoji: '👍' },
    { name: 'love', emoji: '❤️' },
    { name: 'haha', emoji: '😆' },
    { name: 'wow', emoji: '😮' },
    { name: 'sad', emoji: '😢' },
    { name: 'angry', emoji: '😠' }
  ];

  // Handle reaction click
  const handleReaction = async (type) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để thả cảm xúc');
      setShowReactions(false);
      return;
    }

    try {
      setLoading(true);
      
      // Send reaction to API
      await commentService.addReaction({
        commentId: commentId,
        reactionType: type
      });
      
      setShowReactions(false);
    } catch (error) {
      toast.error('Không thể thả cảm xúc: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.reactionContainer}>
      <Button
        ref={target}
        variant="link"
        size="sm"
        className={`${styles.reactionButton} ${currentReaction ? styles.hasReacted : ''}`}
        onClick={() => currentReaction ? handleReaction(currentReaction) : setShowReactions(!showReactions)}
        disabled={loading || !user}
      >
        {currentReaction ? (
          <>
            {commentService.getReactionEmoji(currentReaction)} {currentReaction.charAt(0).toUpperCase() + currentReaction.slice(1)}
          </>
        ) : (
          'Thích'
        )}
      </Button>

      <Overlay
        target={target.current}
        show={showReactions}
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
                className={styles.reactionOption}
                onClick={() => handleReaction(reaction.name)}
                disabled={loading}
              >
                {reaction.emoji}
              </Button>
            ))}
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default CommentReactionButton;
