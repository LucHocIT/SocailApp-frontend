// PostCard Footer Component
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaComment, FaShareAlt, FaEye } from 'react-icons/fa';
import { PostReactionButton, PostReactionStack } from '../reactions';
import styles from '../styles/postcard/PostCard.module.scss';

const PostCardFooter = ({ 
  post, 
  viewsCount, 
  onShare, 
  onShowComments, 
  onShowReactionUsers 
}) => {  return (
    <Card.Footer className={styles.cardFooter}>      
      <div className={styles.actionButtons}>
        <div className={styles.leftActions}>
          <div className={styles.reactionButtonWrapper}>
            <PostReactionButton 
              postId={post.id} 
              onShowUsers={onShowReactionUsers} 
            />
          </div>

          <Button
            variant="link"
            className={styles.actionButton}
            onClick={onShowComments} 
          >
            <FaComment className={styles.actionIcon} />
            <span className={styles.actionCount}>{post.commentsCount}</span>
          </Button>
            
          <Button 
            variant="link" 
            className={styles.actionButton}
            onClick={onShare}
          >
            <FaShareAlt className={styles.actionIcon} />
            <span className={styles.actionLabel}>Chia sẻ</span>
          </Button>
        </div>

        {/* Reaction stack with total count on the right */}
        <div className={styles.reactionSection}>
          <PostReactionStack 
            postId={post.id} 
            reactionCounts={post.reactionCounts}
            onClick={onShowReactionUsers}
            maxVisible={5}
          />
        </div>
        
        <div className={styles.viewCount}>
          <FaEye className={styles.viewIcon} />
          <span>{viewsCount || 0} lượt xem</span>
        </div>
      </div>
    </Card.Footer>
  );
};

export default PostCardFooter;
