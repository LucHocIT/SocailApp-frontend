import { useState, useEffect, useCallback } from 'react';
import postService from '../services/postService';
import { useAuth } from './useAuth'; // assuming you have an auth hook

const useReaction = ({ postId = null, commentId = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reactionSummary, setReactionSummary] = useState({
    totalCount: 0,
    reactionCounts: {},
    hasReactedByCurrentUser: false,
    currentUserReactionType: null,
  });
  const { isAuthenticated } = useAuth(); // get authentication status
  
  // Fetch reactions on mount and when dependencies change
  useEffect(() => {
    if (!postId && !commentId) return;
    
    const fetchReactions = async () => {
      try {
        setLoading(true);
        setError(null);
          let data;
        if (postId) {
          data = await postService.getPostReactions(postId);
        } else if (commentId) {
          data = await postService.getCommentReactions(commentId);
        }
        
        setReactionSummary(data);
      } catch (err) {
        console.error('Error fetching reactions:', err);
        setError('Failed to load reactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReactions();
  }, [postId, commentId]);
  
  // Handle reaction changes
  const handleReaction = useCallback(async ({ reactionType }) => {
    if (!isAuthenticated) {
      // Redirect to login or show login dialog
      console.log('Please login to react');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!reactionType) {
        // Remove reaction
        if (reactionSummary.hasReactedByCurrentUser) {
          // Note: In a real app, you would need to store reaction IDs to delete them properly
          // For now, we'll just update the UI as if it worked
          setReactionSummary(prev => {
            const oldType = prev.currentUserReactionType;
            const newCounts = { ...prev.reactionCounts };
            
            if (newCounts[oldType] && newCounts[oldType] > 0) {
              newCounts[oldType]--;
              if (newCounts[oldType] === 0) {
                delete newCounts[oldType];
              }
            }
            
            return {
              ...prev,
              totalCount: Math.max(0, prev.totalCount - 1),
              reactionCounts: newCounts,
              hasReactedByCurrentUser: false,
              currentUserReactionType: null
            };
          });
        }
      } else {
        // Add or update reaction
        const payload = {
          postId,
          commentId,
          reactionType 
        };
        
        await postService.addReaction(payload);
        
        // Update local state
        setReactionSummary(prev => {
          const newCounts = { ...prev.reactionCounts };
          const oldType = prev.currentUserReactionType;
          
          // If user had a previous different reaction, decrement that count
          if (oldType && oldType !== reactionType) {
            if (newCounts[oldType] && newCounts[oldType] > 0) {
              newCounts[oldType]--;
              if (newCounts[oldType] === 0) {
                delete newCounts[oldType];
              }
            }
          }
          
          // Increment the new reaction type
          newCounts[reactionType] = (newCounts[reactionType] || 0) + (oldType ? 0 : 1);
          
          return {
            ...prev,
            totalCount: oldType ? prev.totalCount : prev.totalCount + 1,
            reactionCounts: newCounts,
            hasReactedByCurrentUser: true,
            currentUserReactionType: reactionType
          };
        });
      }
    } catch (err) {
      console.error('Error handling reaction:', err);
      setError('Failed to process reaction');
    } finally {
      setLoading(false);
    }
  }, [postId, commentId, reactionSummary.hasReactedByCurrentUser, isAuthenticated]);
  
  return {
    loading,
    error,
    reactionSummary,
    handleReaction,
    hasReacted: reactionSummary.hasReactedByCurrentUser,
    currentReactionType: reactionSummary.currentUserReactionType
  };
};

export default useReaction;
