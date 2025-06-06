import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaComments, FaArrowUp } from 'react-icons/fa';
import CommentItem from './CommentItem';
import commentService from '../../services/commentService';
import styles from './styles/CommentList.module.scss';

const CommentList = forwardRef(({ postId, sortBy = 'newest' }, ref) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  // Expose methods to parent through ref
  useImperativeHandle(ref, () => ({
    handleCommentAdded: (newComment) => {
      setComments(prevComments => [newComment, ...prevComments]);
      setTotalComments(prev => prev + 1);
    },
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    scrollToComment: (commentId) => {
      const commentElement = document.getElementById(`comment-${commentId}`);
      if (commentElement && containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const commentRect = commentElement.getBoundingClientRect();
        
        // Calculate scroll position relative to container
        const scrollTop = container.scrollTop + commentRect.top - containerRect.top - 20;
        
        container.scrollTo({ 
          top: scrollTop, 
          behavior: 'smooth' 
        });
        
        // Add highlight effect
        commentElement.classList.add('highlighted-comment');
        setTimeout(() => {
          commentElement.classList.remove('highlighted-comment');
        }, 3000);
      }
    }
  }));
  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async (pageNum = 1, resetComments = false) => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await commentService.getCommentsByPostId(postId, {
        page: pageNum,
        limit: 10,
        sortBy
      });
      
      const fetchedComments = response?.comments || response || [];
      const total = response?.total || fetchedComments.length;
      
      if (resetComments || pageNum === 1) {
        setComments(fetchedComments);
      } else {
        setComments(prev => [...prev, ...fetchedComments]);
      }
      
      setTotalComments(total);
      setHasMore(fetchedComments.length === 10); // Assuming 10 comments per page
    } catch (error) {
      const errorMessage = error.message || 'Lỗi không xác định';
      setError(errorMessage);
      toast.error('Không thể tải bình luận: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [postId, sortBy]);

  // Load more comments
  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    fetchComments(nextPage);
    setPage(nextPage);
  }, [fetchComments, hasMore, loading, page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, handleLoadMore]);
    // Initial fetch
  useEffect(() => {
    fetchComments(1, true);
    setPage(1);
  }, [fetchComments]);

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
    setTotalComments(prev => Math.max(prev - 1, 0));
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Retry loading comments
  const retryLoading = () => {
    setError(null);
    fetchComments(1, true);
    setPage(1);
  };
    // Loading state for initial load
  if (loading && comments.length === 0 && !error) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <Spinner animation="border" variant="primary" />
          <p>Đang tải bình luận...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && comments.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <Alert variant="danger" className={styles.errorAlert}>
          <FaComments className={styles.errorIcon} />
          <div>
            <h6>Không thể tải bình luận</h6>
            <p>{error}</p>
            <Button variant="outline-primary" size="sm" onClick={retryLoading}>
              Thử lại
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (comments.length === 0 && !loading && !error) {
    return (
      <div className={styles.emptyComments}>
        <FaComments className={styles.emptyIcon} />
        <h6>Chưa có bình luận nào</h6>
        <p>Hãy là người đầu tiên bình luận!</p>
      </div>
    );
  }

  return (
    <div className={styles.commentsContainer}>
      {totalComments > 0 && (
        <div className={styles.commentsHeader}>
          <h6 className={styles.commentsCount}>
            {totalComments} bình luận
          </h6>
        </div>
      )}
      
      <div ref={containerRef} className={styles.commentsList}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        ))}
        
        {/* Infinite scroll trigger */}
        {hasMore && <div ref={observerRef} className={styles.scrollTrigger} />}
        
        {/* Loading more indicator */}
        {loading && comments.length > 0 && (
          <div className={styles.loadingMore}>
            <Spinner animation="border" size="sm" />
            <span>Đang tải thêm bình luận...</span>
          </div>
        )}
        
        {/* Manual load more button (fallback) */}
        {hasMore && !loading && (
          <Button
            variant="outline-secondary"
            size="sm"
            className={styles.loadMoreButton}
            onClick={handleLoadMore}
          >
            Tải thêm bình luận
          </Button>
        )}
        
        {/* End of comments indicator */}
        {!hasMore && comments.length > 5 && (
          <div className={styles.endOfComments}>
            <small>Đã hiển thị tất cả bình luận</small>
          </div>
        )}
      </div>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          variant="primary"
          className={styles.scrollTopButton}
          onClick={scrollToTop}
        >
          <FaArrowUp />
        </Button>
      )}
    </div>
  );
});

export default CommentList;
