import React, { useState } from 'react';
import { Button, Image, Dropdown } from 'react-bootstrap';
import { FaEllipsisV, FaTrash, FaPencilAlt, FaReply } from 'react-icons/fa';
import { useAuth } from '../../context/hooks';
import TimeAgo from 'react-timeago';
import { convertUtcToLocal } from '../../utils/dateUtils';
import CommentReactionButton from './CommentReactionButton';
import CommentReactionUsersModal from './CommentReactionUsersModal';
import CommentForm from './CommentForm';
import styles from './styles/Comment.module.scss';
import { toast } from 'react-toastify';
import commentService from '../../services/commentService';

 const Comment = ({ 
  comment, 
  postId, 
  level = 0, 
  onCommentUpdated,
  onCommentDeleted 
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 1); // Auto-expand first level replies
  const [showReactionUsersModal, setShowReactionUsersModal] = useState(false);
  const isAuthor = user && user.id === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 3; // Maximum nesting level to display
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      // Update UI immediately before API call
      onCommentDeleted(comment.id);
      
      // Make API call without waiting for response
      commentService.deleteComment(comment.id)
        .catch(error => {
          // If API call fails, show error and potentially revert the UI update
          toast.error(error.message || 'Failed to delete comment');
          // TODO: Potentially revert the UI update
        });
    } catch (error) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };
  
  const handleEdit = (updatedComment) => {
    setIsEditing(false);
    onCommentUpdated(updatedComment);
  };
  
  const handleNewReply = (newComment) => {
    setIsReplying(false);
    setShowReplies(true);
    onCommentUpdated(newComment);
  };
  // Calculate indentation based on nesting level
  const indentStyle = level > 0 ? styles.nestedComment : '';
  
  return (
    <div className={`${styles.commentContainer} ${indentStyle}`}>
      <div className={styles.commentWrapper}>
        <div className={styles.userInfo}>
          <Image 
            src={comment.profilePictureUrl || '/default-avatar.png'} 
            roundedCircle 
            className={styles.avatar}
            alt={`${comment.username}'s avatar`}
          />
          <div className={styles.commentBubble}>
            <div className={styles.commentHeader}>
              <strong className={styles.userName}>{comment.username}</strong>
              
              {isAuthor && (
                <Dropdown className={styles.commentDropdown}>
                  <Dropdown.Toggle variant="link" className={styles.dropdownToggle}>
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => setIsEditing(true)}>
                      <FaPencilAlt className="me-2" /> Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDelete} className="text-danger">
                      <FaTrash className="me-2" /> Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
            
            {isEditing ? (
              <CommentForm
                postId={postId}
                initialContent={comment.content}
                commentId={comment.id}
                onSubmitSuccess={handleEdit}
                onCancel={() => setIsEditing(false)}
                isEditing={true}
              />
            ) : (
              <div className={styles.contentText}>{comment.content}</div>
            )}
          </div>
        </div>
        
        <div className={styles.commentFooter}>
          <div className={styles.actionLinks}>
            <CommentReactionButton 
              commentId={comment.id}
              comment={comment}
              onShowUsers={() => setShowReactionUsersModal(true)}
            />
            
            {level < maxDepth && (
              <Button 
                variant="link" 
                size="sm" 
                className={styles.actionLink}
                onClick={() => setIsReplying(!isReplying)}
              >
                Reply
              </Button>
            )}
            
            <small className={styles.timeAgo}>
              {comment.createdAt && <TimeAgo date={convertUtcToLocal(comment.createdAt)} />}
              {comment.updatedAt && comment.createdAt && comment.updatedAt !== comment.createdAt && 
                <span className={styles.edited}> (edited)</span>
              }
            </small>
          </div>
        </div>
      </div>
      
      {isReplying && (
        <div className={styles.replyForm}>
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSubmitSuccess={handleNewReply}
            onCancel={() => setIsReplying(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}
      
      {/* Replies section */}
      {hasReplies && (
        <div className={styles.repliesSection}>
          {showReplies ? (
            <>
              <Button 
                variant="link" 
                className={styles.toggleReplies}
                onClick={() => setShowReplies(false)}
              >
                Hide replies ({comment.replies.length})
              </Button>
              
              <div className={styles.replies}>
                {comment.replies.map(reply => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    level={level + 1}
                    onCommentUpdated={onCommentUpdated}
                    onCommentDeleted={onCommentDeleted}
                  />
                ))}
              </div>
            </>
          ) : (
            <Button 
              variant="link" 
              className={styles.toggleReplies}
              onClick={() => setShowReplies(true)}
            >
              Show replies ({comment.replies.length})
            </Button>
          )}
        </div>
      )}
      
      {/* Reaction Users Modal */}
      <CommentReactionUsersModal 
        show={showReactionUsersModal}
        onHide={() => setShowReactionUsersModal(false)}
        commentId={comment.id}
      />
    </div>
  );
};

// Export the component
export { Comment };
export default Comment;
