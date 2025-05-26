import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CommentItem from './CommentItem';
import commentService from '../../services/commentService';
import styles from './styles/CommentList.module.scss';

const CommentList = ({ postId, commentsCount }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Fetch comments
  const fetchComments = useCallback(async (pageNum = 1) => {
    if (!postId) return;
    
    try {
      setLoading(true);
      
      const response = await commentService.getCommentsByPostId(postId);
      const fetchedComments = response || [];
      
      if (pageNum === 1) {
        setComments(fetchedComments);
      } else {
        setComments(prev => [...prev, ...fetchedComments]);
      }
      
      setHasMore(fetchedComments.length === 10); // Assuming 10 comments per page
    } catch (error) {
      toast.error('Không thể tải bình luận: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  }, [postId]);
  
  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  // Load more comments
  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchComments(nextPage);
    setPage(nextPage);
  };
  
  // Handle comment updates
  const handleCommentUpdated = (updatedComment) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        }
        return comment;
      });
    });
  };
  
  // Handle comment deletion
  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
  };
  
  if (loading && comments.length === 0) {
    return (
      <div className={styles.loadingSpinner}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  
  if (comments.length === 0 && !loading) {
    return (
      <div className={styles.emptyComments}>
        <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
      </div>
    );
  }
  
  return (
    <div className={styles.commentsContainer}>
      <div className={styles.commentsList}>
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        ))}
      </div>
      
      {hasMore && (
        <Button
          variant="outline-secondary"
          size="sm"
          className={styles.loadMoreButton}
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? (
            <><Spinner as="span" animation="border" size="sm" /> Đang tải</>
          ) : (
            'Tải thêm bình luận'
          )}
        </Button>
      )}
    </div>
  );
};

export default CommentList;
