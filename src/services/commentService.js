import api from './api';

const commentService = {
  // Get all comments for a post
  getCommentsByPostId: async (postId) => {
    try {
      const response = await api.get(`/comments/post/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi lấy bình luận' };
    }
  },
  
  // Create a new comment
  createComment: async (commentData) => {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi tạo bình luận' };
    }
  },

  // Update an existing comment
  updateComment: async (commentId, commentData) => {
    try {
      const response = await api.put(`/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật bình luận' };
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      return true;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi xóa bình luận' };
    }
  },

  // Add or toggle a reaction to a comment
  addReaction: async (reactionData) => {
    try {
      const response = await api.post('/comments/reaction', reactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi thả cảm xúc cho bình luận' };
    }
  },
  
  // Get replies for a comment
  getReplies: async (commentId) => {
    try {
      const response = await api.get(`/comments/replies/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi lấy phản hồi cho bình luận' };
    }
  },
    // Get detailed reactions for a comment
  getCommentReactions: async (commentId) => {
    try {
      const response = await api.get(`/comments/${commentId}/reactions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi lấy thông tin cảm xúc bình luận' };
    }
  },

  // Get reaction emoji
  getReactionEmoji: (type) => {
    switch (type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'haha': return '😆';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '👍';
    }
  },

  // Report a comment
  reportComment: async (reportData) => {
    try {
      const response = await api.post('/comments/report', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi báo cáo bình luận' };
    }
  },

  // Get comment reports (Admin only)
  getCommentReports: async (status = 'Pending') => {
    try {
      const response = await api.get(`/comments/reports?status=${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi lấy danh sách báo cáo' };
    }
  },

  // Update comment report status (Admin only)
  updateReportStatus: async (reportId, statusData) => {
    try {
      const response = await api.put(`/comments/report/${reportId}`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi khi cập nhật trạng thái báo cáo' };
    }
  }
};

export default commentService;
