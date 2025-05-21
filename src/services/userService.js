import api from './api';

class UserService {
  // Lấy thông tin profile người dùng theo ID
  async getUserProfile(userId) {
    try {
      const response = await api.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy thông tin profile người dùng hiện tại
  async getCurrentUserProfile() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cập nhật thông tin profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/profile', profileData);
      
      // Cập nhật thông tin user trong localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const updatedUser = { 
          ...user, 
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đổi mật khẩu
  async changePassword(passwordData) {
    try {
      const response = await api.put('/profile/password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tải lên ảnh đại diện
  async uploadProfilePicture(imageFile) {
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);

      const response = await api.post('/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Cập nhật thông tin user trong localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const updatedUser = { 
          ...user, 
          profilePictureUrl: response.data.profilePictureUrl 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xóa ảnh đại diện
  async removeProfilePicture() {
    try {
      const response = await api.delete('/profile/picture');
      
      // Cập nhật thông tin user trong localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const updatedUser = { ...user, profilePictureUrl: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Theo dõi người dùng
  async followUser(userId) {
    try {
      const response = await api.post(`/profile/follow/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bỏ theo dõi người dùng
  async unfollowUser(userId) {
    try {
      const response = await api.delete(`/profile/unfollow/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách người theo dõi
  async getFollowers(userId, page = 1, pageSize = 10) {
    try {
      const response = await api.get(`/profile/${userId}/followers?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lấy danh sách đang theo dõi
  async getFollowing(userId, page = 1, pageSize = 10) {
    try {
      const response = await api.get(`/profile/${userId}/following?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Xử lý lỗi
  handleError(error) {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (error.response) {
      // Response từ server với mã lỗi
      if (error.response.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Lỗi: ${error.response.status}`;
      }
    } else if (error.request) {
      // Không nhận được response
      errorMessage = 'Không thể kết nối đến máy chủ';
    } else {
      // Lỗi khi thiết lập request
      errorMessage = error.message;
    }

    return new Error(errorMessage);
  }
}

export default new UserService();
