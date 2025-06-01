import api from './api';

const API_BASE_URL = '/api/userblock';

export const userBlockService = {
  // Block a user
  blockUser: async (blockedUserId, reason = null) => {
    try {
      const response = await api.post(`${API_BASE_URL}/block`, {
        blockedUserId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  // Unblock a user
  unblockUser: async (blockedUserId) => {
    try {
      const response = await api.post(`${API_BASE_URL}/unblock`, {
        blockedUserId
      });
      return response.data;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  },

  // Get block status with another user
  getBlockStatus: async (userId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/status/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting block status:', error);
      throw error;
    }
  },

  // Check if a specific user is blocked
  isUserBlocked: async (userId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/is-blocked/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      throw error;
    }
  },

  // Check if users are mutually blocking each other
  checkMutualBlock: async (userId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/mutual-block/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking mutual block:', error);
      throw error;
    }
  },

  // Get list of blocked users
  getBlockedUsers: async (page = 1, pageSize = 10) => {
    try {
      const response = await api.get(`${API_BASE_URL}/blocked-users`, {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  }
};

export default userBlockService;
