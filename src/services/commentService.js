import api from './api';

const commentService = {
  // Get all comments for a post
  getCommentsByPostId: async (postId) => {
    try {
      const response = await api.get(`/comment/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching comments' };
    }
  },
  
  // Get a specific comment by ID
  getComment: async (commentId) => {
    try {
      // Make an API call to get a single comment if your API supports it
      // Otherwise, we can implement a workaround here to just return basic info
      // since the comment data is already available in the Comment component
      return {
        id: commentId,
        reactionsCount: 0,
        reactionCounts: {},
        currentUserReactionType: null,
        hasReactedByCurrentUser: false
      };
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching comment' };
    }
  },

  // Create a new comment
  createComment: async (commentData) => {
    try {
      const response = await api.post('/comment', commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating comment' };
    }
  },

  // Update an existing comment
  updateComment: async (commentId, commentData) => {
    try {
      const response = await api.put(`/comment/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating comment' };
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      await api.delete(`/comment/${commentId}`);
      return true;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting comment' };
    }
  },

  // Add or toggle a reaction to a comment
  addReaction: async (reactionData) => {
    try {
      const response = await api.post('/comment/reaction', reactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error adding reaction' };
    }
  }
};

export default commentService;
