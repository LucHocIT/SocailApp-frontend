import React, { useState, useRef, useEffect } from 'react';
import { Button, Image, Dropdown, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaReply, FaEllipsisH, FaTrash, FaPen, FaFlag, FaRegSmile, FaRegPaperPlane } from 'react-icons/fa';
import TimeAgo from 'react-timeago';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/hooks';
import { parseDate } from '../../utils/dateUtils';
import commentService from '../../services/commentService';
import CommentReactionButton from './CommentReactionButton';
import CommentReactionStack from './CommentReactionStack';
import CommentForm from './CommentForm';
import ReportCommentModal from './ReportCommentModal';
import styles from './styles/CommentItem.module.scss';

const CommentItem = ({ comment, postId, onCommentUpdated, onCommentDeleted, depth = 0 }) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyFormVisible, setReplyFormVisible] = useState(false);  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.content);  const [loadingAction, setLoadingAction] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const commentRef = useRef(null);
  const editTextareaRef = useRef(null);
  const isAuthor = user?.id === comment.userId;
  const canReply = depth < 3; // Limit nesting to 3 levels
  // Fix isEdited logic - check if updatedAt is significantly different from createdAt
  const isEdited = comment.updatedAt && comment.createdAt && 
    Math.abs(new Date(comment.updatedAt) - new Date(comment.createdAt)) > 1000; // 1 second difference
    // Toggle replies visibility and load replies if needed
  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      try {
        setLoadingReplies(true);
        const repliesData = await commentService.getReplies(comment.id);
        // Sort replies by createdAt to ensure consistent ordering
        const sortedReplies = repliesData.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setReplies(sortedReplies);
      } catch (error) {
        toast.error('Không thể tải phản hồi: ' + (error.message || 'Lỗi không xác định'));
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };// Handle reply submission  
  const handleReplyAdded = (newReply) => {
    // Add new reply and sort by createdAt to match backend ordering
    const updatedReplies = [...replies, newReply].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    setReplies(updatedReplies);
    setReplyFormVisible(false);
    
    // Update replies count
    comment.repliesCount = (comment.repliesCount || 0) + 1;
    
    // Show replies if not already visible
    if (!showReplies) {
      setShowReplies(true);
    }
    
    // Notify parent component about the update
    if (onCommentUpdated) {
      onCommentUpdated(newReply);
    }
  };

  // Handle editing comment
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editText.trim() || editText === comment.content) {
      setEditMode(false);
      return;
    }
    
    try {
      setLoadingAction(true);
      
      const updatedComment = await commentService.updateComment(comment.id, {
        content: editText
      });
        // Update local state
      comment.content = updatedComment.content;
      comment.updatedAt = updatedComment.updatedAt;
      
      setEditMode(false);
      setShowEmojiPicker(false);
      
      // Notify parent component about the update
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }
    } catch (error) {
      toast.error('Không thể cập nhật bình luận: ' + (error.message || 'Lỗi không xác định'));
      setEditText(comment.content);  // Reset to original content on error
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle comment deletion
  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này không?')) {
      try {
        setLoadingAction(true);
        
        await commentService.deleteComment(comment.id);
        
        toast.success('Đã xóa bình luận');
        
        // Notify parent component about deletion
        if (onCommentDeleted) {
          onCommentDeleted(comment.id);
        }
      } catch (error) {
        toast.error('Không thể xóa bình luận: ' + (error.message || 'Lỗi không xác định'));
      } finally {
        setLoadingAction(false);
      }    }
  };

  // Handle reply deletion
  const handleReplyDeleted = (replyId) => {
    setReplies(prevReplies => prevReplies.filter(reply => reply.id !== replyId));
    // Update replies count
    comment.repliesCount = Math.max((comment.repliesCount || 0) - 1, 0);
    
    // Notify parent if needed
    if (onCommentDeleted) {
      onCommentDeleted(replyId);
    }
  };  // Handle reaction change with state persistence
  const handleReactionChange = (newReaction) => {
    // Update comment reactions state
    if (comment.userReaction !== newReaction) {
      comment.userReaction = newReaction;
      
      // Update reaction counts
      if (!comment.reactionCounts) {
        comment.reactionCounts = {};
      }
      
      // If there was a previous reaction, decrement it
      if (comment.userReaction && comment.reactionCounts[comment.userReaction]) {
        comment.reactionCounts[comment.userReaction] = Math.max(0, comment.reactionCounts[comment.userReaction] - 1);
      }
      
      // If new reaction, increment it
      if (newReaction) {
        comment.reactionCounts[newReaction] = (comment.reactionCounts[newReaction] || 0) + 1;
      }
      
      // Notify parent component
      if (onCommentUpdated) {
        onCommentUpdated({ ...comment, userReaction: newReaction });
      }
    }
  };

  // Handle emoji click for edit mode
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = editTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = editText.substring(0, start) + emoji + editText.substring(end);
    
    setEditText(newText);
    
    // Set cursor position after emoji
    setTimeout(() => {
      const newCursorPos = start + emoji.length;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  // Toggle emoji picker for edit mode
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && 
          commentRef.current && 
          !commentRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Auto-resize textarea in edit mode
  useEffect(() => {
    if (editMode && editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${Math.min(editTextareaRef.current.scrollHeight, 120)}px`;
    }
  }, [editText, editMode]);
  return (
    <div 
      ref={commentRef} 
      id={`comment-${comment.id}`}
      className={`${styles.commentContainer} ${depth > 0 ? styles.nested : ''}`}
    >
      <div className={styles.comment}>
        <Link to={`/profile/${comment.username}`} className={styles.commentAvatar}>
          <Image 
            src={comment.profilePictureUrl || '/images/default-avatar.png'} 
            roundedCircle 
            className={styles.avatarImage}
          />
        </Link>
        
        <div className={styles.commentContent}>
          <div className={styles.commentHeader}>
            <div className={styles.commentInfo}>              <Link to={`/profile/${comment.username}`} className={styles.username}>
                {comment.firstName && comment.lastName ? `${comment.firstName} ${comment.lastName}` : comment.username}
                {comment.isVerified && <Badge bg="primary" className={styles.verifiedBadge}>✓</Badge>}
              </Link>
              <div className={styles.commentMeta}>                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{new Date(parseDate(comment.createdAt)).toLocaleString()}</Tooltip>}
                >
                  <span className={styles.timestamp}>
                    <TimeAgo date={parseDate(comment.createdAt)} />
                    {isEdited && <span className={styles.editedLabel}> • đã chỉnh sửa</span>}
                  </span>
                </OverlayTrigger>
              </div>
            </div>
            
            {user && (
              <Dropdown 
                show={showMoreActions}
                onToggle={(isOpen) => setShowMoreActions(isOpen)}
                className={styles.actionsDropdown}
              >
                <Dropdown.Toggle 
                  as="button" 
                  className={styles.actionButton}
                  disabled={loadingAction}
                >
                  <FaEllipsisH />
                </Dropdown.Toggle>                <Dropdown.Menu align="end">
                  {isAuthor && (
                    <>
                      <Dropdown.Item onClick={() => setEditMode(true)}>
                        <FaPen /> Chỉnh sửa
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleDelete}>
                        <FaTrash /> Xóa
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  {!isAuthor && (
                    <Dropdown.Item onClick={() => setShowReportModal(true)}>
                      <FaFlag /> Báo cáo
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>            {editMode ? (
            <form onSubmit={handleEditSubmit} className={styles.editForm}>
              <div className={styles.editInputWrapper}>
                <textarea 
                  ref={editTextareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className={styles.editInput}
                  disabled={loadingAction}
                  autoFocus
                  rows="3"
                  maxLength={1000}
                  placeholder="Chỉnh sửa bình luận..."
                />
                <div className={styles.editInputActions}>
                  <button
                    type="button"
                    onClick={toggleEmojiPicker}
                    className={styles.emojiButton}
                    disabled={loadingAction}
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
                </div>
              </div>
              <div className={styles.editActions}>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setEditMode(false);
                    setEditText(comment.content);
                    setShowEmojiPicker(false);
                  }}
                  disabled={loadingAction}
                >
                  Hủy
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  type="submit"
                  disabled={!editText.trim() || editText === comment.content || loadingAction}
                  className={styles.saveButton}
                >
                  {loadingAction ? <Spinner as="span" animation="border" size="sm" /> : <><FaRegPaperPlane /> Lưu</>}
                </Button>
              </div>
            </form>
          ) : (
            <div className={styles.commentText}>{comment.content}</div>
          )}
          
          <div className={styles.commentActions}>            <div className={styles.leftActions}>
              <CommentReactionButton 
                commentId={comment.id} 
                currentReaction={comment.currentUserReactionType}
                onReactionChange={handleReactionChange}
              />
              
              {canReply && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className={styles.replyButton} 
                  onClick={() => setReplyFormVisible(!replyFormVisible)}
                  disabled={!user}
                >
                  <FaReply /> Phản hồi
                </Button>
              )}            </div>
            
            <CommentReactionStack 
              commentId={comment.id}
              reactionCounts={comment.reactionCounts}
              maxVisible={3}
            />
          </div>
          
          {(comment.repliesCount && Number(comment.repliesCount) > 0) && (
            <Button
              variant="link"
              className={styles.viewRepliesButton}
              onClick={toggleReplies}
              disabled={loadingReplies}
            >
              {loadingReplies ? (
                <><Spinner as="span" animation="border" size="sm" /> Đang tải</>
              ) : (
                <>{showReplies ? 'Ẩn' : 'Xem'} {comment.repliesCount} phản hồi</>
              )}
            </Button>
          )}
            {replyFormVisible && user && canReply && (
            <CommentForm
              postId={postId}
              parentCommentId={comment.id}
              onCommentAdded={handleReplyAdded}
              placeholder={`Phản hồi ${comment.username}...`}
            />
          )}
          
          {showReplies && replies.length > 0 && (
            <div className={styles.repliesContainer}>
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onCommentUpdated={onCommentUpdated}
                  onCommentDeleted={handleReplyDeleted}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}        </div>
      </div>
      
      <ReportCommentModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        commentId={comment.id}
        commentContent={comment.content}
        commentAuthor={comment.firstName && comment.lastName ? `${comment.firstName} ${comment.lastName}` : comment.username}
      />
    </div>
  );
};

export default CommentItem;
