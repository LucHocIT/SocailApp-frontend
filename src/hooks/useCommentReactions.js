import { useState, useEffect, useCallback } from 'react';
import commentService from '../services/commentService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/hooks';

const useCommentReactions = (commentId) => {
  const [loading, setLoading] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(null);
  const [totalReactions, setTotalReactions] = useState(0);
  const [reactionCounts, setReactionCounts] = useState({});
  const { user } = useAuth();
  
  // Calculate reaction counts from comment data
  const processCommentReactions = useCallback((commentData) => {
    if (!commentData) return;
    
    // Get reaction counts from the comment reactionCounts object
    if (commentData.reactionCounts) {
      setReactionCounts(commentData.reactionCounts);
      setTotalReactions(commentData.reactionsCount || 0);
      
      // Set current user reaction if user has reacted
      if (commentData.hasReactedByCurrentUser) {
        setCurrentReaction(commentData.currentUserReactionType || null);
      } else {
        setCurrentReaction(null);
      }
    } else {
      setReactionCounts({});
      setTotalReactions(0);
      setCurrentReaction(null);
    }
  }, []);
  
  // Handle adding or toggling a reaction
  const handleReaction = async (type) => {
    if (!user) {
      toast.error('You must be logged in to react to comments');
      return;
    }
    
    setLoading(true);
    try {
      const reactionDto = {
        commentId: commentId,
        reactionType: type
      };
      
      const updatedComment = await commentService.addReaction(reactionDto);
      processCommentReactions(updatedComment);
    } catch (error) {
      toast.error(error.message || 'Failed to process reaction');
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a reaction
  const removeReaction = async () => {
    if (!currentReaction || !user) return;
    
    setLoading(true);
    try {
      // To remove, just click the same reaction again to toggle
      const reactionDto = {
        commentId: commentId,
        reactionType: currentReaction
      };
      
      const updatedComment = await commentService.addReaction(reactionDto);
      processCommentReactions(updatedComment);
    } catch (error) {
      toast.error(error.message || 'Failed to remove reaction');
    } finally {
      setLoading(false);
    }
  };

  // Initialize with data from the comment prop if available
  useEffect(() => {
    // If commentId is valid and we have a comment object in props, process it
    if (commentId) {
      // We'll get updates to reactions through the onCommentUpdated callback
      // in the Comment component, which will pass updated data here
    }
  }, [commentId]);
  
  return {
    loading,
    currentReaction,
    totalReactions,
    reactionCounts,
    handleReaction,
    removeReaction
  };
};

export default useCommentReactions;
