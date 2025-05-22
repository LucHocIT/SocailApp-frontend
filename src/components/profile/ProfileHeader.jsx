import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../context';
import { FaCamera, FaShieldAlt, FaEdit, FaKey, FaEnvelope, FaUserCheck, FaUserPlus, FaSpinner } from 'react-icons/fa';
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
  const { uploadProfilePicture } = useProfile();
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isCoverHovered, setIsCoverHovered] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef(null);
  const coverFileRef = useRef(null);
  
  const handleProfilePictureClick = () => {
    if (isOwnProfile && !isUploadingAvatar) {
      fileInputRef.current.click();
    }
  };

  const handleCoverClick = () => {
    if (isOwnProfile && !isUploadingCover) {
      coverFileRef.current.click();
    }
  };
  
  const handleFileChange = async (e, type = 'avatar') => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }

    const uploadStateSetter = type === 'avatar' ? setIsUploadingAvatar : setIsUploadingCover;
    
    try {
      uploadStateSetter(true);
      const response = await uploadProfilePicture(file);
      toast.success('Cập nhật ảnh thành công!');
      onProfileUpdated({
        [type === 'avatar' ? 'profilePictureUrl' : 'coverPhotoUrl']: response.url
      });
    } catch (error) {
      toast.error(error.message || 'Tải lên ảnh thất bại!');
    } finally {
      uploadStateSetter(false);
    }
  };

  const handleKeyPress = (handler) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handler(e);
    }
  };

  return (
    <div className={styles.header}>
      {/* Cover Photo Section */}
      <div 
        className={styles.coverPhoto}
        onMouseEnter={() => setIsCoverHovered(true)}
        onMouseLeave={() => setIsCoverHovered(false)}
      >
        <div className={styles.coverContent}>
          {profileData.coverPhotoUrl ? (
            <img src={profileData.coverPhotoUrl} alt="Cover" />
          ) : (
            <div className={styles.defaultCover}>
              <div className={styles.coverPattern} />
            </div>
          )}
          <div className={styles.coverOverlay} />
        </div>

        {isOwnProfile && (isCoverHovered || isUploadingCover) && (
          <button 
            className={`${styles.editCoverBtn} ${isUploadingCover ? styles.loading : ''}`}
            onClick={handleCoverClick}
            disabled={isUploadingCover}
            aria-label="Thay đổi ảnh bìa"
          >
            {isUploadingCover ? (
              <FaSpinner className={styles.spinner} />
            ) : (
              <>
                <FaCamera />
                <span>Thay đổi ảnh bìa</span>
              </>
            )}
          </button>
        )}

        <input 
          type="file"
          ref={coverFileRef}
          className={styles.fileInput}
          onChange={(e) => handleFileChange(e, 'cover')}
          accept="image/jpeg, image/png, image/gif"
          aria-label="Upload ảnh bìa"
        />
      </div>

      <div className={styles.profileInfo}>
        {/* Avatar Section */}
        <div className={styles.avatarContainer}>
          <div
            className={`${styles.avatarWrapper} ${isUploadingAvatar ? styles.loading : ''}`}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            onClick={handleProfilePictureClick}
            onKeyPress={handleKeyPress(handleProfilePictureClick)}
            tabIndex={isOwnProfile ? 0 : -1}
            role={isOwnProfile ? 'button' : undefined}
            aria-label={isOwnProfile ? 'Thay đổi ảnh đại diện' : undefined}
          >
            {profileData.profilePictureUrl ? (
              <img 
                src={profileData.profilePictureUrl} 
                alt={`${profileData.firstName} ${profileData.lastName}`}
                className={styles.profileAvatar}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                <span>
                  {profileData.firstName?.charAt(0) || ''}
                  {profileData.lastName?.charAt(0) || ''}
                </span>
              </div>
            )}
            
            {isOwnProfile && (isAvatarHovered || isUploadingAvatar) && (
              <div className={styles.avatarEditOverlay}>
                {isUploadingAvatar ? (
                  <FaSpinner className={styles.spinner} />
                ) : (
                  <>
                    <FaCamera size={24} />
                    <span>Thay đổi ảnh</span>
                  </>
                )}
              </div>
            )}

            {profileData.isVerified && (
              <div className={styles.verifiedBadge} title="Tài khoản đã xác thực">
                <FaShieldAlt />
              </div>
            )}
          </div>

          <input 
            type="file"
            ref={fileInputRef}
            className={styles.fileInput}
            onChange={(e) => handleFileChange(e, 'avatar')}
            accept="image/jpeg, image/png, image/gif"
            aria-label="Upload ảnh đại diện"
          />
        </div>

        {/* Profile Meta Information */}
        <div className={styles.profileMeta}>
          <h1 className={styles.profileName}>
            {profileData.firstName} {profileData.lastName}
            {profileData.isVerified && (
              <FaShieldAlt className={styles.verifiedIcon} title="Tài khoản đã xác thực" />
            )}
          </h1>

          <p className={styles.username}>
            @{profileData.username}
            {profileData.role === 'Admin' && (
              <span className={styles.roleTag}>Admin</span>
            )}
          </p>
          
          {!isEditing && (
            <p className={styles.bio}>
              {profileData.bio || 'Chưa có thông tin giới thiệu.'}
            </p>
          )}
        </div>
        
        {/* Profile Statistics */}
        <div className={styles.profileStats}>
          <button 
            className={styles.statItem} 
            onClick={onShowFollowers}
            aria-label={`${profileData.followersCount} người theo dõi`}
          >
            <span className={styles.statValue}>
              {new Intl.NumberFormat('vi-VN').format(profileData.followersCount)}
            </span>
            <span className={styles.statLabel}>Người theo dõi</span>
          </button>

          <button 
            className={styles.statItem} 
            onClick={onShowFollowing}
            aria-label={`Đang theo dõi ${profileData.followingCount} người`}
          >  
            <span className={styles.statValue}>
              {new Intl.NumberFormat('vi-VN').format(profileData.followingCount)}
            </span>
            <span className={styles.statLabel}>Đang theo dõi</span>
          </button>

          <button 
            className={styles.statItem}
            aria-label={`${profileData.postsCount} bài viết`}
          >
            <span className={styles.statValue}>
              {new Intl.NumberFormat('vi-VN').format(profileData.postsCount)}
            </span>
            <span className={styles.statLabel}>Bài viết</span>
          </button>
        </div>

        {/* Profile Actions */}
        <div className={styles.profileActions}>
          {isOwnProfile ? (
            <>
              <button 
                className={`${styles.actionButton} ${styles.primaryButton}`}
                onClick={onToggleEditing}
                aria-label="Chỉnh sửa thông tin cá nhân"
              >
                <FaEdit />
                <span>{isEditing ? 'Hủy' : 'Chỉnh sửa thông tin'}</span>
              </button>

              <button 
                className={`${styles.actionButton} ${styles.secondaryButton}`}
                onClick={onTogglePasswordChange}
                aria-label="Thay đổi mật khẩu"
              >
                <FaKey />
                <span>Đổi mật khẩu</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className={`${styles.actionButton} ${
                  profileData.isFollowing ? styles.outlineButton : styles.primaryButton
                }`}
                onClick={profileData.isFollowing ? handleUnfollow : handleFollow}
                aria-label={profileData.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
              >
                {profileData.isFollowing ? (
                  <>
                    <FaUserCheck />
                    <span>Đang theo dõi</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    <span>Theo dõi</span>
                  </>
                )}
              </button>

              <button 
                className={`${styles.actionButton} ${styles.secondaryButton}`}
                aria-label="Gửi tin nhắn"
              >
                <FaEnvelope />
                <span>Nhắn tin</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
