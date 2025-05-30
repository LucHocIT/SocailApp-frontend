import api from './api';

class MessageService {
  // Get user conversations
  async getConversations(page = 1, pageSize = 20) {
    try {
      const response = await api.get('/message/conversations', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }  // Get or create conversation with a user
  async getOrCreateConversation(otherUserId) {
    try {
      const response = await api.post('/message/conversations', otherUserId, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get messages in a conversation
  async getMessages(conversationId, before = null, limit = 50) {
    try {
      const params = { limit };
      if (before) params.before = before;
      
      const response = await api.get(`/message/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // For backward compatibility
  async getConversationMessages(conversationId, before = null, limit = 50) {
    return this.getMessages(conversationId, before, limit);
  }
  // Send message to conversation
  async sendMessageToConversation(conversationId, content, receiverId, mediaFiles = null) {
    try {
      const formData = new FormData();
      formData.append('ReceiverId', receiverId);
      if (content) formData.append('Content', content);
        if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append('MediaFiles', file);        });
      }

      const response = await api.post('/message/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message to conversation:', error);
      throw error;
    }
  }

  // Send message (legacy method - sends to user directly)
  async sendMessage(receiverId, content, mediaFiles = null) {
    try {
      const formData = new FormData();
      formData.append('ReceiverId', receiverId);
      if (content) formData.append('Content', content);
      
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append('MediaFiles', file);
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

  // Mark messages as read
  async markMessagesAsRead(conversationId, lastReadMessageId = null) {
    try {
      const response = await api.post(`/message/conversations/${conversationId}/mark-read`, 
        lastReadMessageId || '');
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
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

  // Get users online status
  async getUsersOnlineStatus(userIds) {
    try {
      const response = await api.post('/message/users/online-status', userIds);
      return response.data;
    } catch (error) {
      console.error('Error getting online status:', error);
      return {};
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      await api.delete(`/message/conversations/${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

export default new MessageService();
