import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import commentService from '../../services/commentService';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { toast } from 'react-toastify';
import styles from './styles/CommentList.module.scss';
import { useAuth } from '../../context/hooks';

const CommentList = ({ postId, commentCount }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);
  
  const loadComments = async () => {
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
  };
  
  // Recursively build the comment tree
  const getChildComments = (parentId, allComments) => {
    const children = allComments.filter(c => c.parentId === parentId);
    return children.map(child => ({
      ...child,
      replies: getChildComments(child.id, allComments)
    }));
  };
  
  const handleCommentCreated = (newComment) => {
    // If it's a top-level comment, add to the list
    if (!newComment.parentId) {
      setComments(prevComments => [...prevComments, { ...newComment, replies: [] }]);
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
      <h5 className={styles.commentHeader}>
        Comments{commentCount > 0 ? ` (${commentCount})` : ''}
      </h5>
      
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
    </div>
  );
};

export default CommentList;
