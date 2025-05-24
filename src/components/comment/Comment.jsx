import React, { useState } from 'react';
import { Card, Button, Image, Dropdown } from 'react-bootstrap';
import { FaEllipsisV, FaTrash, FaPencilAlt, FaReply } from 'react-icons/fa';
import { useAuth } from '../../context/hooks';
import TimeAgo from 'react-timeago';
import { convertUtcToLocal } from '../../utils/dateUtils';
import CommentReactionButton from './CommentReactionButton';
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
  const isAuthor = user && user.id === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 3; // Maximum nesting level to display
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await commentService.deleteComment(comment.id);
      toast.success('Comment deleted successfully');
      onCommentDeleted(comment.id);
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
  const indentStyle = {
    marginLeft: level > 0 ? `${Math.min(level, 3) * 20}px` : '0',
  };
  
  return (
    <div className={styles.commentContainer} style={indentStyle}>
      <Card className={styles.commentCard}>
        <Card.Body>
          <div className={styles.commentHeader}>
            <div className={styles.userInfo}>              <Image 
                src={comment.profilePictureUrl || '/default-avatar.png'} 
                roundedCircle 
                className={styles.avatar}
                alt={`${comment.username}'s avatar`}
              />
              <div>
                <Card.Title className={styles.userName}>
                  {comment.username}
                </Card.Title><small className={styles.timeAgo}>
                  <TimeAgo date={convertUtcToLocal(comment.createdAt)} />
                  {comment.updatedAt !== comment.createdAt && <span className={styles.edited}> (edited)</span>}
                </small>
              </div>
            </div>
            
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
            <Card.Text className={styles.commentContent}>
              {comment.content}
            </Card.Text>
          )}
            <div className={styles.commentActions}>
            <CommentReactionButton 
              commentId={comment.id}
              comment={comment}
              onShowUsers={() => {}} // Implement user list modal if needed
            />
            
            {level < maxDepth && (
              <Button 
                variant="link" 
                size="sm" 
                className={styles.replyButton}
                onClick={() => setIsReplying(!isReplying)}
              >
                <FaReply /> Reply
              </Button>
            )}
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
        </Card.Body>
      </Card>
      
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
              
              <div className={styles.replies}>                {comment.replies.map(reply => (                  <Comment
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
    </div>
  );
};

export default Comment;
