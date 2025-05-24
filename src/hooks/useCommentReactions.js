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
  const processCommentReactions = useCallback((comment) => {
    if (!comment) return;
    
    // Get reaction counts from the comment reactionCounts object
    if (comment.reactionCounts) {
      setReactionCounts(comment.reactionCounts);
      setTotalReactions(comment.reactionsCount || 0);
      
      // Set current user reaction
      setCurrentReaction(comment.currentUserReactionType || null);
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
      
      // If clicking the same reaction, remove it (toggle)
      const isRemove = type === currentReaction;
      
      const updatedComment = await commentService.addReaction(reactionDto);
      processCommentReactions(updatedComment);
      
      if (isRemove) {
        toast.success('Reaction removed!', { autoClose: 1500 });
      } else {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} reaction added!`, { autoClose: 1500 });
      }
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
      toast.success('Reaction removed!', { autoClose: 1500 });
    } catch (error) {
      toast.error(error.message || 'Failed to remove reaction');
    } finally {
      setLoading(false);
    }  };
  // Initialize with data from the comment prop if available
  useEffect(() => {
    // We will get reaction data directly from the Comment component
    // The Comment component already has the comment data with reactions
    // No need to fetch separately here
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
