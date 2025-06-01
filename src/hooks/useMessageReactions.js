import { useState, useCallback } from 'react';
import chatService from '../services/chatService';
import { useAuth } from '../context/hooks';
import { toast } from 'react-toastify';

const useMessageReactions = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toggleReaction = useCallback(async (messageId, reactionType, optimisticCallback = null) => {
    if (!user) {
      toast.error('You must be logged in to react to messages');
      return { success: false, message: 'Login required' };
    }

    if (!messageId || !reactionType) {
      console.error('Message ID and reaction type are required');
      return { success: false, message: 'Message ID and reaction type are required' };
    }

    setIsLoading(true);
    setError(null);
    
    // Optimistic update - update UI immediately before API call
    if (optimisticCallback) {
      optimisticCallback(messageId, reactionType, user.id);
    }
    
    try {
      const result = await chatService.toggleMessageReaction(messageId, reactionType);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Failed to toggle reaction';
      setError(errorMessage);
      toast.error('Failed to update reaction: ' + errorMessage);
      
      // Rollback optimistic update on error
      if (optimisticCallback) {
        // Call rollback by toggling again
        optimisticCallback(messageId, reactionType, user.id, true);
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  const addReaction = useCallback(async (messageId, reactionType) => {
    if (!user) {
      toast.error('You must be logged in to react to messages');
      return { success: false, message: 'Login required' };
    }

    if (!messageId || !reactionType) {
      console.error('Message ID and reaction type are required');
      return { success: false, message: 'Message ID and reaction type are required' };
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await chatService.addMessageReaction(messageId, reactionType);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add reaction';
      setError(errorMessage);
      toast.error('Failed to add reaction: ' + errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  const removeReaction = useCallback(async (messageId) => {
    if (!user) {
      toast.error('You must be logged in to remove reactions');
      return { success: false, message: 'Login required' };
    }

    if (!messageId) {
      console.error('Message ID is required');
      return { success: false, message: 'Message ID is required' };
    }

    setIsLoading(true);
    setError(null);
    try {
      await chatService.removeMessageReaction(messageId);
      return { success: true, message: 'Reaction removed successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove reaction';
      setError(errorMessage);
      toast.error('Failed to remove reaction: ' + errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  const getReactions = useCallback(async (messageId) => {
    if (!messageId) {
      console.error('Message ID is required');
      return { success: false, message: 'Message ID is required' };
    }

    setIsLoading(true);
    setError(null);
    try {
      const reactions = await chatService.getMessageReactions(messageId);
      return { success: true, data: reactions };
    } catch (err) {
      const errorMessage = err.message || 'Failed to get reactions';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReactionDetails = useCallback(async (messageId) => {
    if (!messageId) {
      console.error('Message ID is required');
      return { success: false, message: 'Message ID is required' };
    }

    setIsLoading(true);
    setError(null);
    try {
      const details = await chatService.getMessageReactionDetails(messageId);
      return { success: true, data: details };
    } catch (err) {
      const errorMessage = err.message || 'Failed to get reaction details';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReactionsByType = useCallback(async (messageId, reactionType) => {
    if (!messageId || !reactionType) {
      console.error('Message ID and reaction type are required');
      return { success: false, message: 'Message ID and reaction type are required' };
    }

    setIsLoading(true);
    setError(null);
    try {
      const reactions = await chatService.getMessageReactionsByType(messageId, reactionType);
      return { success: true, data: reactions };
    } catch (err) {
      const errorMessage = err.message || 'Failed to get reactions by type';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    toggleReaction,
    addReaction,
    removeReaction,
    getReactions,
    getReactionDetails,
    getReactionsByType,
    isLoading,
    error,
    clearError: () => setError(null),
    canReact: !!user
  };
};

export default useMessageReactions;
