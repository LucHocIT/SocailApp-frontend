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
    
    const counts = {
      like: 0,
      love: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };
    
    if (comment.reactions && comment.reactions.length > 0) {
      // Count reactions by type
      comment.reactions.forEach(reaction => {
        if (counts[reaction.type] !== undefined) {
          counts[reaction.type]++;
        }
      });
      
      // Find user's current reaction
      if (user) {
        const userReaction = comment.reactions.find(r => r.userId === user.id);
        setCurrentReaction(userReaction ? userReaction.type : null);
      }
      
      setTotalReactions(comment.reactions.length);
    } else {
      setCurrentReaction(null);
      setTotalReactions(0);
    }
    
    setReactionCounts(counts);
  }, [user]);
  
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

  // Fetch comment data when commentId changes
  useEffect(() => {
    const fetchCommentData = async () => {
      if (!commentId) return;
      
      setLoading(true);
      try {
        const comment = await commentService.getComment(commentId);
        processCommentReactions(comment);
      } catch (error) {
        console.error('Failed to load comment reactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommentData();
  }, [commentId, user, processCommentReactions]); // Include processCommentReactions as it's now defined before this effect
  
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
