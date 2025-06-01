import React, { createContext, useContext, useState, useCallback } from 'react';
import userBlockService from '../services/userBlockService';

const UserBlockContext = createContext();

export const useUserBlock = () => {
  const context = useContext(UserBlockContext);
  if (!context) {
    throw new Error('useUserBlock must be used within a UserBlockProvider');
  }
  return context;
};

export const UserBlockProvider = ({ children }) => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockStatuses, setBlockStatuses] = useState({}); // Cache block statuses
  const [loading, setLoading] = useState(false);

  // Block a user
  const blockUser = useCallback(async (userId, reason = null) => {
    try {
      setLoading(true);
      const result = await userBlockService.blockUser(userId, reason);
      
      // Update local state
      setBlockStatuses(prev => ({
        ...prev,
        [userId]: { isBlocked: true, isBlockedBy: false, areMutuallyBlocking: false }
      }));

      return result;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unblock a user
  const unblockUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      const result = await userBlockService.unblockUser(userId);
      
      // Update local state
      setBlockStatuses(prev => ({
        ...prev,
        [userId]: { isBlocked: false, isBlockedBy: false, areMutuallyBlocking: false }
      }));

      // Remove from blocked users list
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));

      return result;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get block status with caching
  const getBlockStatus = useCallback(async (userId) => {
    try {
      // Return cached status if available
      if (blockStatuses[userId]) {
        return blockStatuses[userId];
      }

      const status = await userBlockService.getBlockStatus(userId);
      
      // Cache the status
      setBlockStatuses(prev => ({
        ...prev,
        [userId]: status
      }));

      return status;
    } catch (error) {
      console.error('Error getting block status:', error);
      return { isBlocked: false, isBlockedBy: false, areMutuallyBlocking: false };
    }
  }, [blockStatuses]);

  // Check if user is blocked (simplified)
  const isUserBlocked = useCallback(async (userId) => {
    try {
      const result = await userBlockService.isUserBlocked(userId);
      return result.isBlocked;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }, []);

  // Load blocked users list
  const loadBlockedUsers = useCallback(async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const result = await userBlockService.getBlockedUsers(page, pageSize);
      
      if (page === 1) {
        setBlockedUsers(result.users || []);
      } else {
        setBlockedUsers(prev => [...prev, ...(result.users || [])]);
      }

      return result;
    } catch (error) {
      console.error('Error loading blocked users:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache for a specific user
  const clearBlockStatusCache = useCallback((userId) => {
    setBlockStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[userId];
      return newStatuses;
    });
  }, []);

  // Clear all cache
  const clearAllBlockStatusCache = useCallback(() => {
    setBlockStatuses({});
  }, []);

  const value = {
    blockedUsers,
    blockStatuses,
    loading,
    blockUser,
    unblockUser,
    getBlockStatus,
    isUserBlocked,
    loadBlockedUsers,
    clearBlockStatusCache,
    clearAllBlockStatusCache
  };

  return (
    <UserBlockContext.Provider value={value}>
      {children}
    </UserBlockContext.Provider>
  );
};

export default UserBlockContext;
