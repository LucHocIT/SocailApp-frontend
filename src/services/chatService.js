import api from './api';

class ChatService {
  async getChatRooms(page = 1, pageSize = 20) {
    try {
      const response = await api.get(`/chat/rooms?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  async getChatRoom(chatRoomId) {
    try {
      const response = await api.get(`/chat/rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  }

  async getChatMessages(chatRoomId, page = 1, pageSize = 50) {
    try {
      const response = await api.get(`/chat/rooms/${chatRoomId}/messages?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  async sendMessage(chatRoomId, messageData) {
    try {
      const response = await api.post(`/chat/rooms/${chatRoomId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async createChatRoom(chatRoomData) {
    try {
      const response = await api.post('/chat/rooms', chatRoomData);
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  async addMember(chatRoomId, memberData) {
    try {
      const response = await api.post(`/chat/rooms/${chatRoomId}/members`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  async removeMember(chatRoomId, memberUserId) {
    try {
      const response = await api.delete(`/chat/rooms/${chatRoomId}/members/${memberUserId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  async leaveChatRoom(chatRoomId) {
    try {
      const response = await api.post(`/chat/rooms/${chatRoomId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Error leaving chat room:', error);
      throw error;
    }
  }

  async deleteChatRoom(chatRoomId) {
    try {
      const response = await api.delete(`/chat/rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chat room:', error);
      throw error;
    }
  }

  async getOrCreatePrivateChat(otherUserId) {
    try {
      const response = await api.post(`/chat/private/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Error creating private chat:', error);
      throw error;
    }
  }

  async markMessagesAsRead(chatRoomId, messageIds) {
    try {
      const response = await api.post(`/chat/rooms/${chatRoomId}/messages/read`, messageIds);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm) {
    try {
      const response = await api.get(`/chat/users/search?searchTerm=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async updateChatRoom(chatRoomId, updateData) {
    try {
      const response = await api.put(`/chat/rooms/${chatRoomId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating chat room:', error);
      throw error;
    }
  }
}

export default new ChatService();
