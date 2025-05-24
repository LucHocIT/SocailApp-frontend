// filepath: e:\SocialApp\frontend\src\hooks\usePostReactions.js
import { useState, useEffect, useCallback } from "react";
import postService from "../services/postService";
import { useAuth } from "../context/hooks";

/**
 * Custom hook to handle post reactions
 * 
 * @param {number} postId - The post ID
 * @returns {Object} - Reaction data and handlers
 */
const usePostReactions = (postId) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({});
  const [totalReactions, setTotalReactions] = useState(0);
  const [currentReaction, setCurrentReaction] = useState(null);

  // Fetch reactions on component mount
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        setLoading(true);
        const data = await postService.getPostReactions(postId);
        
        setReactionCounts(data.reactionCounts || {});
        setTotalReactions(data.totalCount || 0);
        
        if (user && data.hasReactedByCurrentUser) {
          setCurrentReaction(data.currentUserReactionType);
        }
      } catch (err) {
        console.error("Failed to fetch reactions:", err);
        setError("Could not load reactions");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchReactions();
    }
  }, [postId, user]);

  // Handle reaction change
  const handleReaction = useCallback(async ({ reactionType }) => {
    if (!user) {
      return { success: false, message: "Login required to react" };
    }

    try {
      const payload = {
        postId,
        reactionType
      };

      // Check if user is toggling the same reaction (clicking the one they already have)
      const oldReaction = currentReaction;
      const isRemovingSameReaction = oldReaction === reactionType;

      // Optimistically update UI
      if (isRemovingSameReaction) {
        // Removing reaction - user is toggling off their current reaction
        setCurrentReaction(null);
        setReactionCounts(prev => {
          const updated = {...prev};
          if (updated[oldReaction] && updated[oldReaction] > 0) {
            updated[oldReaction]--;
            if (updated[oldReaction] === 0) delete updated[oldReaction];
          }
          
          // Update total count based on updated reaction counts
          const newTotal = Object.values(updated).reduce((sum, count) => sum + count, 0);
          setTotalReactions(newTotal);
          
          return updated;
        });
        
        // Call API to remove the reaction
        await postService.removeReaction(postId);
      } else {
        // Either adding a new reaction or changing to a different one
        setCurrentReaction(reactionType);
        setReactionCounts(prev => {
          const updated = {...prev};
          
          // If changing reaction type, decrement previous type
          if (oldReaction) {
            if (updated[oldReaction] && updated[oldReaction] > 0) {
              updated[oldReaction]--;
              if (updated[oldReaction] === 0) delete updated[oldReaction];
            }
          }
          
          // Increment new reaction type
          updated[reactionType] = (updated[reactionType] || 0) + 1;
          
          // Update total count based on the updated reaction counts
          const newTotal = Object.values(updated).reduce((sum, count) => sum + count, 0);
          setTotalReactions(newTotal);
          return updated;
        });
        
        // Call API to add or update the reaction
        await postService.addReaction(payload);
      }

      return { success: true };
    } catch (err) {
      console.error("Error handling reaction:", err);
      
      // Revert optimistic update on error
      setCurrentReaction(currentReaction);
      
      // Refresh reactions to ensure correct state
      try {
        const data = await postService.getPostReactions(postId);
        setReactionCounts(data.reactionCounts || {});
        setTotalReactions(data.totalCount || 0);
        if (data.hasReactedByCurrentUser) {
          setCurrentReaction(data.currentUserReactionType);
        } else {
          setCurrentReaction(null);
        }
      } catch (refreshError) {
        console.error("Failed to refresh reactions:", refreshError);
      }
      
      return { success: false, message: "Failed to update reaction" };
    }
  }, [postId, currentReaction, user]);

  // Handle reaction removal directly
  const removeReaction = useCallback(async () => {
    if (!user) {
      return { success: false, message: "Login required to remove reaction" };
    }
    
    if (!currentReaction) {
      return { success: true, message: "No reaction to remove" };
    }

    try {
      // Optimistic UI update
      const oldReactionType = currentReaction;
      
      // Update UI state
      setCurrentReaction(null);
      setReactionCounts(prev => {
        const updated = {...prev};
        if (updated[oldReactionType] && updated[oldReactionType] > 0) {
          updated[oldReactionType]--;
          if (updated[oldReactionType] === 0) delete updated[oldReactionType];
        }
        
        // Update total count based on the updated reaction counts
        const newTotal = Object.values(updated).reduce((sum, count) => sum + count, 0);
        setTotalReactions(newTotal);
        
        return updated;
      });
      
      // Call API
      await postService.removeReaction(postId);
      
      return { success: true };
    } catch (err) {
      console.error("Error removing reaction:", err);
      
      // Refresh reactions to ensure correct state
      try {
        const data = await postService.getPostReactions(postId);
        setReactionCounts(data.reactionCounts || {});
        setTotalReactions(data.totalCount || 0);
        if (data.hasReactedByCurrentUser) {
          setCurrentReaction(data.currentUserReactionType);
        } else {
          setCurrentReaction(null);
        }
      } catch (refreshError) {
        console.error("Failed to refresh reactions:", refreshError);
      }
      
      return { success: false, message: "Failed to remove reaction" };
    }
  }, [postId, currentReaction, user]);

  return {
    loading,
    error,
    reactionCounts,
    totalReactions,
    currentReaction,
    handleReaction,
    removeReaction
  };
};

export default usePostReactions;
