import api from './api';

const postService = {
  // Get all posts with optional filtering
  getPosts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.pageNumber) queryParams.append('pageNumber', filters.pageNumber);
      if (filters.pageSize) queryParams.append('pageSize', filters.pageSize);
      if (filters.username) queryParams.append('username', filters.username);
      if (filters.onlyFollowing !== undefined) queryParams.append('onlyFollowing', filters.onlyFollowing);

      const response = await api.get(`/posts?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching posts' };
    }
  },

  // Get a single post by ID
  getPost: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching post' };
    }
  },

  // Create a new post
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating post' };
    }
  },

  // Update an existing post
  updatePost: async (postId, postData) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating post' };
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting post' };
    }
  },  // Toggle reaction on a post
  toggleReaction: async (postId, reactionType) => {
    try {
      const response = await api.post(`/reactions/post/${postId}`, { reactionType });
      return response.data;
    } catch (error){
      throw error.response?.data || { message: 'Error toggling reaction' };
    }
  },  // Upload multiple media files for a post
  uploadMultipleMedia: async (mediaFiles, mediaTypes) => {
    try {
      const formData = new FormData();
      
      // Add all media files to form data
      for (let i = 0; i < mediaFiles.length; i++) {
        formData.append('MediaFiles', mediaFiles[i]);
      }
      
      // Add corresponding media types
      for (let i = 0; i < mediaTypes.length; i++) {
        formData.append('MediaTypes', mediaTypes[i]);
      }
      
      const response = await api.post('/posts/upload-multiple-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error uploading media files' };
    }
  },

  // Legacy: Upload single media for a post (kept for backward compatibility)
  uploadMedia: async (mediaFile, mediaType = "image") => {
    try {
      // Use the multiple media upload endpoint with single file
      return await postService.uploadMultipleMedia([mediaFile], [mediaType]);
    } catch (error) {
      throw error.response?.data || { message: 'Error uploading media' };
    }
  },
  
  // === REACTIONS FUNCTIONALITY ===
  
  /**
   * Add or update a reaction to a post
   * 
   * @param {Object} reactionData - The reaction data 
   * @param {number} reactionData.postId - The post ID
   * @param {string} reactionData.reactionType - The reaction type ('like', 'love', 'haha', 'wow', 'sad', 'angry')
   * @returns {Promise} - The response from the API
   */
  addReaction: async (reactionData) => {
    try {
      const response = await api.post('/reactions', reactionData);
      return response.data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },
  /**
   * Remove a reaction from a post
   * 
   * @param {number} postId - The post ID to remove reaction from
   * @returns {Promise} - The response from the API
   */
  removeReaction: async (postId) => {
    try {
      const response = await api.delete(`/reactions/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  /**
   * Get all reactions for a post
   * 
   * @param {number} postId - The post ID
   * @returns {Promise} - The response from the API
   */
  getPostReactions: async (postId) => {
    try {
      const response = await api.get(`/reactions/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting post reactions:', error);
      throw error;
    }
  },
  /**
   * Get users who reacted to a post
   * 
   * @param {number} postId - The post ID to get reactions for
   * @returns {Promise} - The response from the API containing users and their reactions
   */
  getReactionUsers: async (postId) => {
    try {
      const response = await api.get(`/reactions/history/${postId}`);
      
      // Chuyển đổi cấu trúc dữ liệu để phù hợp với mong đợi của component
      return {
        users: response.data.map(reaction => ({
          id: reaction.userId,
          username: reaction.username,
          profilePictureUrl: reaction.profilePictureUrl,
          reactionType: reaction.reactionType,
          isVerified: reaction.isVerified || false
        }))
      };
    } catch (error) {
      console.error('Error getting reaction users:', error);
      throw error;
    }
  },

  /**
   * Get emoji representation for reaction types
   * 
   * @param {string} type - Reaction type
   * @returns {string} - Emoji character
   */
  getReactionEmoji: (type) => {
    const emojiMap = {
      like: '👍',
      love: '❤️',
      haha: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😠'
    };
    
    return emojiMap[type] || '👍';
  },

  /**
   * Get color for reaction types
   * 
   * @param {string} type - Reaction type
   * @returns {string} - CSS color variable
   */
  getReactionColor: (type) => {
    const colorMap = {
      like: '--blue-color',
      love: '--red-color',
      haha: '--yellow-color',
      wow: '--yellow-color',
      sad: '--yellow-color',
      angry: '--orange-color'
    };
    
    return colorMap[type] || '--primary-color';
  }
};

export default postService;
