import { createContext, useState } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../hooks';

// Create profile context
const ProfileContext = createContext();

// Provider component
export const ProfileProvider = ({ children }) => {
  const { setUser } = useAuth(); // Only using setUser for now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      await userService.updateProfile(profileData);
      
      // Update user state with new profile data
      setUser(prevUser => ({
        ...prevUser,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio
      }));
      
      return true;
    } catch (err) {
      setError(err.message || 'Cập nhật hồ sơ thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.uploadProfilePicture(imageFile);
      
      // Update user state with new profile picture URL
      setUser(prevUser => ({
        ...prevUser,
        profilePictureUrl: response.profilePictureUrl
      }));
      
      return response;
    } catch (err) {
      setError(err.message || 'Tải lên ảnh đại diện thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload cropped profile picture
  const uploadCroppedProfilePicture = async (imageFile, cropData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.uploadCroppedProfilePicture(imageFile, cropData);
      
      // Update user state with new profile picture URL
      setUser(prevUser => ({
        ...prevUser,
        profilePictureUrl: response.profilePictureUrl
      }));
      
      return response;
    } catch (err) {
      setError(err.message || 'Tải lên ảnh đại diện đã cắt thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove profile picture
  const removeProfilePicture = async () => {
    setLoading(true);
    setError(null);
    try {
      await userService.removeProfilePicture();
      
      // Update user state with null profile picture URL
      setUser(prevUser => ({
        ...prevUser,
        profilePictureUrl: null
      }));
      
      return true;
    } catch (err) {
      setError(err.message || 'Xóa ảnh đại diện thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      return await userService.changePassword(passwordData);
    } catch (err) {
      setError(err.message || 'Thay đổi mật khẩu thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Follow a user
  const followUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      await userService.followUser(userId);
      return true;
    } catch (err) {
      setError(err.message || 'Không thể theo dõi người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      await userService.unfollowUser(userId);
      return true;
    } catch (err) {
      setError(err.message || 'Không thể bỏ theo dõi người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user followers
  const getFollowers = async (userId, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      return await userService.getFollowers(userId, page, pageSize);
    } catch (err) {
      setError(err.message || 'Không thể lấy danh sách người theo dõi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user following
  const getFollowing = async (userId, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      return await userService.getFollowing(userId, page, pageSize);
    } catch (err) {
      setError(err.message || 'Không thể lấy danh sách đang theo dõi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      return await userService.getUserProfile(userId);
    } catch (err) {
      setError(err.message || 'Không thể lấy thông tin hồ sơ người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile by username
  const getUserProfileByUsername = async (username) => {
    setLoading(true);
    setError(null);
    try {
      return await userService.getUserProfileByUsername(username);
    } catch (err) {
      setError(err.message || 'Không thể lấy thông tin hồ sơ người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const contextValue = {
    profileLoading: loading,
    profileError: error,
    updateProfile,
    uploadProfilePicture,
    uploadCroppedProfilePicture,
    removeProfilePicture,
    changePassword,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getUserProfile,
    getUserProfileByUsername
  };
  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

// Note: useProfile hook is now exported from context/hooks.js
export default ProfileContext;
