import api from './api';

class MessageService {  // Gửi tin nhắn
  async sendMessage(receiverId, content) {
    const response = await api.post('/message/send', {
      receiverId,
      content
    });
    return response.data;
  }  // Lấy danh sách cuộc trò chuyện
  async getConversations() {
    const response = await api.get('/message/conversations');
    return response.data;
  }
  // Lấy tin nhắn trong cuộc trò chuyện
  async getMessages(userId, page = 1, limit = 20) {
    const response = await api.get(`/message/conversation/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  }
  // Đánh dấu tin nhắn đã đọc
  async markAsRead(messageId) {
    const response = await api.put(`/message/mark-read/${messageId}`);
    return response.data;
  }
  // Đánh dấu tất cả tin nhắn trong cuộc trò chuyện đã đọc
  async markConversationAsRead(userId) {
    const response = await api.put(`/message/conversation/${userId}/mark-read`);
    return response.data;
  }
  // Tìm kiếm người dùng để bắt đầu cuộc trò chuyện
  async searchUsers(query) {
    const response = await api.get('/user/search', {
      params: { query }
    });
    return response.data;
  }
}

export default new MessageService();
