import React, { useState, useEffect, useCallback } from 'react';
import { Spinner, Button } from 'react-bootstrap';
import { FaComments, FaCommentSlash } from 'react-icons/fa';
import commentService from '../../services/commentService';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { toast } from 'react-toastify';
import styles from './styles/CommentList.module.scss';
import { useAuth } from '../../context/hooks';

const CommentList = ({ postId, commentCount }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(true);
  const { user } = useAuth();
    // Recursively build the comment tree
  const getChildComments = useCallback((parentId, allComments) => {
    const children = allComments.filter(c => c.parentId === parentId);
    return children.map(child => ({
      ...child,
      replies: getChildComments(child.id, allComments)
    }));
  }, []);
  
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const commentData = await commentService.getCommentsByPostId(postId);
      // Filter top-level comments (no parent)
      const topLevelComments = commentData.filter(c => !c.parentId);
      
      // Organize comments into a hierarchical structure
      const commentTree = topLevelComments.map(comment => {
        return {
          ...comment,
          replies: getChildComments(comment.id, commentData)
        };
      });
      
      setComments(commentTree);
    } catch (error) {
      toast.error('Failed to load comments');
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, getChildComments]);
  
  useEffect(() => {
    if (postId) {
      loadComments();
    }  }, [loadComments, postId]);
    const handleCommentCreated = (newComment) => {
    // If it's a top-level comment, add to the list
    if (!newComment.parentId) {
      setComments(prevComments => [{ ...newComment, replies: [] }, ...prevComments]);
    } else {
      // If it's a reply, update the parent comment
      setComments(prevComments => updateCommentReplies(prevComments, newComment));
    }
  };
  
  const updateCommentReplies = (comments, newReply) => {
    return comments.map(comment => {
      // If this is the parent comment, add the reply
      if (comment.id === newReply.parentId) {
        return {
          ...comment,
          replies: [...comment.replies, { ...newReply, replies: [] }]
        };
      }
      
      // Otherwise check child comments
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentReplies(comment.replies, newReply)
        };
      }
      
      return comment;
    });
  };
  
  const handleCommentUpdated = (updatedComment) => {
    setComments(prevComments => 
      updateCommentInTree(prevComments, updatedComment)
    );
  };
  
  const updateCommentInTree = (comments, updatedComment) => {
    return comments.map(comment => {
      if (comment.id === updatedComment.id) {
        // Keep the existing replies when updating a comment
        return { ...updatedComment, replies: comment.replies || [] };
      }
      
      // Check in replies
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, updatedComment)
        };
      }
      
      return comment;
    });
  };
  
  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => 
      removeCommentFromTree(prevComments, commentId)
    );
  };
  
  const removeCommentFromTree = (comments, commentId) => {
    return comments.filter(comment => comment.id !== commentId).map(comment => {
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: removeCommentFromTree(comment.replies, commentId)
        };
      }
      return comment;
    });
  };
    return (
    <div className={styles.commentListContainer}>
      <div className={styles.commentHeader}>
        <h5 className={styles.commentTitle}>
          Comments{commentCount > 0 ? ` (${commentCount})` : ''}
        </h5>
        <Button 
          variant="link" 
          className={styles.toggleButton}
          onClick={() => setShowCommentSection(!showCommentSection)}
          aria-label={showCommentSection ? "Hide comments" : "Show comments"}
        >
          {showCommentSection ? (
            <><FaCommentSlash /> Hide</>
          ) : (
            <><FaComments /> Show</>
          )}
        </Button>
      </div>
      
      {showCommentSection && (
        <>
          {user && (
            <div className={styles.newCommentForm}>
              <CommentForm 
                postId={postId} 
                onSubmitSuccess={handleCommentCreated} 
              />
            </div>
          )}
          
          {loading ? (
            <div className={styles.loadingSpinner}>
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className={styles.commentList}>
              {comments.length === 0 ? (
                <p className={styles.noComments}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    onCommentUpdated={handleCommentUpdated}
                    onCommentDeleted={handleCommentDeleted}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentList;
