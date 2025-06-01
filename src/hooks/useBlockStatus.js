import { useState, useEffect, useCallback } from 'react';
import { useUserBlock } from '../context/UserBlockContext';

/**
 * Hook to get and manage block status with another user
 * @param {number} userId - The ID of the user to check block status with
 * @param {boolean} autoLoad - Whether to automatically load the status on mount
 * @returns {object} Block status and management functions
 */
export const useBlockStatus = (userId, autoLoad = true) => {
  const { getBlockStatus, blockStatuses } = useUserBlock();
  const [status, setStatus] = useState({
    isBlocked: false,
    isBlockedBy: false,
    areMutuallyBlocking: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Load block status
  const loadStatus = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const blockStatus = await getBlockStatus(userId);
      setStatus(blockStatus);
    } catch (err) {
      setError(err.message);
      console.error('Error loading block status:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, getBlockStatus]);
  // Auto load on mount
  useEffect(() => {
    if (autoLoad && userId) {
      loadStatus();
    }
  }, [userId, autoLoad, loadStatus]);

  // Update status when cache changes
  useEffect(() => {
    if (userId && blockStatuses[userId]) {
      setStatus(blockStatuses[userId]);
    }
  }, [userId, blockStatuses]);

  return {
    status,
    loading,
    error,
    loadStatus,
    // Convenience getters
    isBlocked: status.isBlocked,
    isBlockedBy: status.isBlockedBy,
    areMutuallyBlocking: status.areMutuallyBlocking,
    canCommunicate: !status.isBlocked && !status.isBlockedBy && !status.areMutuallyBlocking
  };
};

/**
 * Hook to check if a user is blocked (simple check)
 * @param {number} userId - The ID of the user to check
 * @returns {object} Block check result
 */
export const useIsUserBlocked = (userId) => {
  const { isUserBlocked } = useUserBlock();
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkBlocked = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const result = await isUserBlocked(userId);
      setBlocked(result);
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      setBlocked(false);
    } finally {
      setLoading(false);
    }
  }, [userId, isUserBlocked]);

  useEffect(() => {
    checkBlocked();
  }, [checkBlocked]);

  return {
    blocked,
    loading,
    checkBlocked
  };
};
