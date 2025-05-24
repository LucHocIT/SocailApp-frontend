import { useState, useEffect, useCallback } from 'react';
import postService from '../services/postService';
import { useAuth } from '../context/hooks';

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
        console.error('Failed to fetch reactions:', err);
        setError('Could not load reactions');
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
      return { success: false, message: 'Login required to react' };
    }

    try {
      const payload = {
        postId,
        reactionType
      };

      // Optimistic UI update
      const oldReaction = currentReaction;
      const isRemovingSameReaction = oldReaction === reactionType;

      // Optimistically update UI
      if (isRemovingSameReaction) {
        // Removing reaction
        setCurrentReaction(null);
        setReactionCounts(prev => {
          const updated = {...prev};
          if (updated[oldReaction] && updated[oldReaction] > 0) {
            updated[oldReaction]--;
            if (updated[oldReaction] === 0) delete updated[oldReaction];
          }
          return updated;
        });
        setTotalReactions(prev => Math.max(0, prev - 1));
      } else {
        // Adding or changing reaction
        setCurrentReaction(reactionType);
        setReactionCounts(prev => {
          const updated = {...prev};
          
          // If changing reaction type, decrement previous type
          if (oldReaction) {
            if (updated[oldReaction] && updated[oldReaction] > 0) {
              updated[oldReaction]--;
              if (updated[oldReaction] === 0) delete updated[oldReaction];
            }
          } else {
            // Only increment total if adding new reaction (not changing)
            setTotalReactions(prev => prev + 1);
          }
          
          // Increment new reaction type
          updated[reactionType] = (updated[reactionType] || 0) + 1;
          return updated;
        });
      }

      // Call API
      if (isRemovingSameReaction) {
        // Send null for reactionType to remove reaction
        await postService.addReaction({
          postId,
          reactionType: null
        });
      } else {
        await postService.addReaction(payload);
      }

      return { success: true };
    } catch (err) {
      console.error('Error handling reaction:', err);
      
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
        console.error('Failed to refresh reactions:', refreshError);
      }
      
      return { success: false, message: 'Failed to update reaction' };
    }
  }, [postId, currentReaction, user]);

  return {
    loading,
    error,
    reactionCounts,
    totalReactions,
    currentReaction,
    handleReaction
  };
};

export default usePostReactions;
