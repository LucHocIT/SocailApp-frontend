import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Spinner, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import commentService from '../../services/commentService';
import { useAuth } from '../../context/hooks';
import styles from './styles/CommentForm.module.scss';

const CommentForm = ({ 
  postId, 
  commentId, 
  parentId = null, 
  initialContent = '', 
  onSubmitSuccess, 
  onCancel,
  isEditing = false,
  autoFocus = false,
  placeholder = 'Write a comment...'
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const { user } = useAuth();
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }
    
    setIsSubmitting(true);
      try {
      const tempCommentId = `temp-${Date.now()}`;
      // Prepare optimistic update data (for immediate UI update)
      const optimisticComment = {
        id: isEditing ? commentId : tempCommentId,
        postId,
        parentId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
        reactionCounts: {},
        reactionsCount: 0
      };
      
      // Save original content for potential rollback
      const originalContent = content.trim();
      
      // Update UI immediately
      if (onSubmitSuccess) {
        onSubmitSuccess(optimisticComment);
      }
      
      // Clear content immediately after updating UI for new comments
      if (!isEditing) {
        setContent('');
      }
      
      // Actual API call
      if (isEditing) {
        const updateData = {
          content: originalContent
        };
        await commentService.updateComment(commentId, updateData);
      } else {
        const commentData = {
          postId: postId,
          parentId: parentId,          content: originalContent
        };        try {
          await commentService.createComment(commentData);
          
          // If needed, we could update the UI with the real comment ID from the server
          // But in most cases, the optimistic update is enough
        } catch (error) {
          // If API call fails, show error but don't revert UI (better UX)
          console.error("API error:", error);
        }
      }
    } catch (error) {
      // If there's an error with the optimistic update process, show an error
      toast.error(error.message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };
    return (    <Form className={styles.commentForm} onSubmit={handleSubmit}>
      <div className={styles.formContent}>
        {user && !isEditing && (
          <div className={styles.userAvatar}>
            <Image 
              src={user.profilePictureUrl || '/images/default-avatar.png'}
              roundedCircle
              width={36}
              height={36}
            />
          </div>
        )}
        
        <Form.Group className={styles.formGroup}>
          <Form.Control
            as="textarea"
            ref={textareaRef}
            value={content}            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.textarea}
            disabled={isSubmitting}
            autoFocus={isEditing || autoFocus}
            style={{ height: 'auto', minHeight: '36px' }}
          />
          
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={styles.inlineSubmitButton}
            aria-label={isEditing ? "Update comment" : "Post comment"}
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </Form.Group>
      </div>
      
      {/* Only show Cancel and Post buttons when in edit mode or when reply mode */}
      {(isEditing || parentId) && (
        <div className={styles.buttonGroup}>
          {onCancel && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              <FaTimesCircle className={styles.buttonIcon} /> Cancel
            </Button>
          )}
          
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <FaPaperPlane className={styles.buttonIcon} /> {isEditing ? 'Update' : 'Post'}
              </>
            )}
          </Button>
        </div>
      )}
    </Form>
  );
};

export default CommentForm;
