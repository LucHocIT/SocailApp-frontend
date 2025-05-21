import { useRef } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../context';
import './ProfileHeader.scss';

const ProfileHeader = ({ 
  profileData, 
  isOwnProfile, 
  handleFollow, 
  handleUnfollow,
  onShowFollowers,
  onShowFollowing,
  onToggleEditing,
  onTogglePasswordChange,
  isEditing,
  onProfileUpdated
}) => {
  const { uploadProfilePicture, removeProfilePicture } = useProfile();
  const fileInputRef = useRef(null);
  
  const handleProfilePictureClick = () => {
    if (isOwnProfile) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }
    
    try {
      const response = await uploadProfilePicture(file);
      toast.success('Cập nhật ảnh đại diện thành công!');
      
      onProfileUpdated({
        profilePictureUrl: response.profilePictureUrl
      });
    } catch (error) {
      toast.error(error.message || 'Tải lên ảnh đại diện thất bại!');
    }
  };
  
  const handleRemoveProfilePicture = async () => {
    try {
      await removeProfilePicture();
      toast.success('Đã xóa ảnh đại diện!');
      
      onProfileUpdated({
        profilePictureUrl: null
      });
    } catch (error) {
      toast.error(error.message || 'Xóa ảnh đại diện thất bại!');
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-image" onClick={handleProfilePictureClick}>
        {profileData.profilePictureUrl ? (
          <img src={profileData.profilePictureUrl} alt={`${profileData.firstName} ${profileData.lastName}`} />
        ) : (
          <div className="default-avatar">
            {profileData.firstName?.charAt(0) || ''}{profileData.lastName?.charAt(0) || ''}
          </div>
        )}
        {isOwnProfile && (
          <div className="profile-image-overlay">
            <span>Thay đổi ảnh</span>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/gif"
        />
      </div>

      <div className="profile-info">
        <h1>{profileData.firstName} {profileData.lastName}</h1>
        <p className="username">@{profileData.username}</p>
        
        {!isEditing && profileData.bio && (
          <p className="bio">{profileData.bio}</p>
        )}
        {!isEditing && !profileData.bio && (
          <p className="bio-empty">Chưa có thông tin giới thiệu.</p>
        )}
        
        <div className="profile-stats">
          <div className="stat" onClick={onShowFollowers}>
            <span className="count">{profileData.followersCount}</span>
            <span className="label">Người theo dõi</span>
          </div>
          <div className="stat" onClick={onShowFollowing}>
            <span className="count">{profileData.followingCount}</span>
            <span className="label">Đang theo dõi</span>
          </div>
          <div className="stat">
            <span className="count">{profileData.postsCount}</span>
            <span className="label">Bài viết</span>
          </div>
        </div>
        
        <div className="profile-actions">
          {isOwnProfile ? (
            <>
              <button 
                className="btn btn-primary"
                onClick={onToggleEditing}
              >
                {isEditing ? 'Hủy' : 'Chỉnh sửa thông tin'}
              </button>
              {isOwnProfile && profileData.profilePictureUrl && (
                <button 
                  className="btn btn-danger"
                  onClick={handleRemoveProfilePicture}
                >
                  Xóa ảnh đại diện
                </button>
              )}
              <button 
                className="btn btn-secondary"
                onClick={onTogglePasswordChange}
              >
                Đổi mật khẩu
              </button>
            </>
          ) : (
            <>
              {profileData.isFollowing ? (
                <button 
                  className="btn btn-outline"
                  onClick={handleUnfollow}
                >
                  Bỏ theo dõi
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={handleFollow}
                >
                  Theo dõi
                </button>
              )}
              <button className="btn btn-secondary">
                Nhắn tin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
