import { useRef } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../context';
import styles from './ProfileHeader.module.scss';

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
    <div className={styles.header}>
      <div className={styles.coverPhoto}>
        {profileData.coverPhotoUrl && (
          <img src={profileData.coverPhotoUrl} alt="Cover" />
        )}
        <div className={styles.coverOverlay}></div>
        {isOwnProfile && (
          <button className={styles.editCover}>
            <i className="fas fa-camera"></i> Thay đổi ảnh bìa
          </button>
        )}
      </div>

      <div className={styles.profileInfo}>
        <div className={styles.avatarContainer}>
          <div 
            className={styles.profileAvatar}
            onClick={handleProfilePictureClick}
          >
            {profileData.profilePictureUrl ? (
              <img src={profileData.profilePictureUrl} alt={`${profileData.firstName} ${profileData.lastName}`} className={styles.profileAvatar} />
            ) : (
              <div className={styles.profileAvatar}>
                {profileData.firstName?.charAt(0) || ''}{profileData.lastName?.charAt(0) || ''}
              </div>
            )}
          </div>
          
          {isOwnProfile && (
            <div className={styles.avatarEditOverlay}>
              <i className="fas fa-camera"></i>
            </div>
          )}
          
          {profileData.isVerified && (
            <div className={styles.verifiedBadge}>
              <i className="fas fa-check"></i>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            className={styles.fileInput}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/gif"
          />
        </div>

        <div className={styles.profileMeta}>
          <h1 className={styles.profileName}>
            {profileData.firstName} {profileData.lastName}
            {profileData.isVerified && (
              <i className={`fas fa-badge-check ${styles.verifiedIcon}`}></i>
            )}
          </h1>
          <p className={styles.username}>@{profileData.username}</p>
          
          {!isEditing && profileData.bio && (
            <p className={styles.bio}>{profileData.bio}</p>
          )}
          {!isEditing && !profileData.bio && (
            <p className={styles.bio}>Chưa có thông tin giới thiệu.</p>
          )}
        </div>
        
        <div className={styles.profileStats}>
          <div className={styles.statItem} onClick={onShowFollowers}>
            <span className={styles.statValue}>{profileData.followersCount}</span>
            <span className={styles.statLabel}>Người theo dõi</span>
          </div>
          <div className={styles.statItem} onClick={onShowFollowing}>
            <span className={styles.statValue}>{profileData.followingCount}</span>
            <span className={styles.statLabel}>Đang theo dõi</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{profileData.postsCount}</span>
            <span className={styles.statLabel}>Bài viết</span>
          </div>
        </div>
        
        <div className={styles.profileActions}>
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
