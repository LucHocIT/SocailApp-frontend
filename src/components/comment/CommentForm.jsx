import React, { useState } from 'react';
import { Form, Button, Image, Spinner } from 'react-bootstrap';
import { FaRegPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/hooks';
import commentService from '../../services/commentService';
import styles from './styles/CommentForm.module.scss';

const CommentForm = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      setLoading(true);
      
      const newComment = await commentService.createComment({
        content: commentText,
        postId: postId
      });
      
      setCommentText('');
      
      // Notify parent component about the new comment
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
      
      toast.success('Đã đăng bình luận');
    } catch (error) {
      toast.error('Không thể đăng bình luận: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.loginPrompt}>
        <p>Vui lòng đăng nhập để bình luận</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmitComment} className={styles.commentForm}>
      <Image
        src={user?.profilePictureUrl || '/images/default-avatar.png'}
        roundedCircle
        className={styles.commentAvatar}
      />
      <div className={styles.inputWrapper}>
        <Form.Control
          type="text"
          as="textarea"
          rows={1}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Viết bình luận..."
          className={styles.commentInput}
          disabled={loading}
        />
        <Button 
          variant="primary"
          type="submit"
          className={styles.commentSubmit}
          disabled={!commentText.trim() || loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <FaRegPaperPlane />
          )}
        </Button>
      </div>
    </Form>
  );
};

export default CommentForm;
