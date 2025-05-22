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
  },

  // Like or unlike a post
  toggleLike: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error toggling like' };
    }
  },
    // Upload media for a post
  uploadMedia: async (mediaFile) => {
    try {
      const formData = new FormData();
      formData.append('media', mediaFile);
      
      const response = await api.post('/posts/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error uploading media' };
    }
  }
};

export default postService;
