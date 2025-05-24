import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
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
  placeholder = 'Write a comment...'
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

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
      let result;
      
      if (isEditing) {
        const updateData = {
          content: content.trim()
        };
        result = await commentService.updateComment(commentId, updateData);
        toast.success('Comment updated successfully');
      } else {
        const commentData = {
          postId: postId,
          parentId: parentId,
          content: content.trim()
        };
        result = await commentService.createComment(commentData);
        toast.success('Comment posted successfully');
        setContent(''); // Clear form after posting
      }
      
      // Call the success callback with the new/updated comment
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
    } catch (error) {
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
  
  return (
    <Form className={styles.commentForm} onSubmit={handleSubmit}>
      <Form.Group className={styles.formGroup}>
        <Form.Control
          as="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className={styles.textarea}
          disabled={isSubmitting}
          autoFocus={isEditing}
        />
      </Form.Group>
      
      <div className={styles.buttonGroup}>
        {onCancel && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            Cancel
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
          ) : isEditing ? 'Update' : 'Post'}
        </Button>
      </div>
    </Form>
  );
};

export default CommentForm;
