import api from './api';

class MessageService {
  
  // Get user conversations
  async getConversations(page = 1, limit = 20) {
    try {
      const response = await api.get('/conversation', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }
  // Get or create conversation with user
  async getOrCreateConversation(userId) {
    try {
      const response = await api.post('/conversation/start', {
        otherUserId: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  // Get messages in conversation
  async getMessages(userId, page = 1, limit = 50) {
    try {
      // First get or create conversation
      const conversation = await this.getOrCreateConversation(userId);
      if (!conversation) {
        return [];
      }

      const response = await api.get(`/message/conversations/${conversation.id}/messages`, {
        params: { page, limit }
      });
      return response.data.messages || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Send message via HTTP (fallback when SignalR is not available)
  async sendMessage(receiverId, content, files = null) {
    try {
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      formData.append('content', content);
      
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post('/message/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark conversation as read
  async markConversationAsRead(userId) {
    try {
      // Get conversation first
      const conversation = await this.getOrCreateConversation(userId);
      if (!conversation) {
        return false;
      }

      const response = await api.post(`/message/conversations/${conversation.id}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await api.get('/message/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get online status of users
  async getUsersOnlineStatus(userIds) {
    try {
      const response = await api.post('/message/users/online-status', userIds);
      return response.data;
    } catch (error) {
      console.error('Error getting users online status:', error);
      return {};
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      const response = await api.delete(`/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Get conversation by ID
  async getConversationById(conversationId) {
    try {
      const response = await api.get(`/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Get messages with pagination
  async getConversationMessages(conversationId, before = null, limit = 50) {
    try {
      const params = { limit };
      if (before) {
        params.before = before;
      }

      const response = await api.get(`/message/conversations/${conversationId}/messages`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  // Search conversations
  async searchConversations(query) {
    try {
      const response = await api.get('/conversation/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching conversations:', error);
      return [];
    }
  }
}

export default new MessageService();
