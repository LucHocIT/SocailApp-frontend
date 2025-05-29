import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Image, Spinner } from 'react-bootstrap';
import { FaRegPaperPlane, FaRegSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/hooks';
import commentService from '../../services/commentService';
import styles from './styles/CommentForm.module.scss';

const CommentForm = ({ postId, parentCommentId, onCommentAdded, placeholder = "Viết bình luận..." }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
    // Function để chèn emoji vào vị trí cursor
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = commentText.substring(0, start) + emoji + commentText.substring(end);
    
    setCommentText(newText);
    
    // Đặt lại vị trí cursor sau emoji
    setTimeout(() => {
      const newCursorPos = start + emoji.length;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [commentText]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.warning('Vui lòng nhập nội dung bình luận');
      return;
    }
    
    if (commentText.trim().length > 1000) {
      toast.error('Bình luận không được quá 1000 ký tự');
      return;
    }
    
    try {
      setLoading(true);
        const commentData = {
        content: commentText.trim(),
        postId: postId
      };
      
      // Add parentCommentId if this is a reply
      if (parentCommentId) {
        commentData.parentCommentId = parentCommentId;
      }
      
      const newComment = await commentService.createComment(commentData);
      
      setCommentText('');
      setIsFocused(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(e);
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
    <Form onSubmit={handleSubmitComment} className={`${styles.commentForm} ${isFocused ? styles.focused : ''}`}>
      <Image
        src={user?.profilePictureUrl || '/images/default-avatar.png'}
        roundedCircle
        className={styles.commentAvatar}
      />
      <div className={styles.inputWrapper}>        <Form.Control
          ref={textareaRef}
          as="textarea"
          rows={1}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={styles.commentInput}
          disabled={loading}
          maxLength={1000}
          aria-label={placeholder}
          aria-describedby="character-count"
        />        <div className={styles.inputActions}>
          <button
            type="button"
            onClick={toggleEmojiPicker}
            className={styles.emojiButton}
            disabled={loading}
          >
            <FaRegSmile />
          </button>
          {showEmojiPicker && (
            <div className={styles.emojiPickerContainer}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={350}
              />
            </div>
          )}
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
        </div>{isFocused && (
          <div id="character-count" className={styles.characterCount}>
            <span className={commentText.length > 900 ? styles.warning : ''}>
              {commentText.length}/1000
            </span>
          </div>
        )}
      </div>
    </Form>
  );
};

export default CommentForm;
