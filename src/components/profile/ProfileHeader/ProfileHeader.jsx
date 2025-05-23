import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProfile, useAuth } from '../../../context/hooks';
import { 
  FaCamera, FaShieldAlt, FaEdit, FaKey, 
  FaEnvelope, FaUserCheck, FaUserPlus, 
  FaSpinner, FaUser, FaList
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import styles from './ProfileHeader.module.scss';

const ProfileHeader = ({ 
  profileData, 
  isOwnProfile,
  loading,
  onFollowUser,
  onUnfollowUser,
  onShowFollowers,
  onShowFollowing,
  onTogglePosts,
  onToggleEditing,
  onTogglePasswordChange,
  onProfileUpdated
}) => {
  const { user } = useAuth();
  const { uploadProfilePicture } = useProfile();
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isCoverHovered, setIsCoverHovered] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  const fileInputRef = useRef(null);
  const coverFileRef = useRef(null);

  useEffect(() => {
    if (profileData && profileData.createdAt) {
      const date = new Date(profileData.createdAt);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      setFormattedDate(date.toLocaleDateString('vi-VN', options));
    }
  }, [profileData]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy hồ sơ người dùng</h2>
        <p>Người dùng này có thể không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className={styles.returnHomeLink}>Quay về trang chủ</Link>
      </div>
    );
  }

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
    <div className={styles.profileHeader}>
      {/* Cover Photo */}
      <div 
        className={styles.coverPhoto}
        onMouseEnter={() => setIsCoverHovered(true)}
        onMouseLeave={() => setIsCoverHovered(false)}
        style={{ 
          backgroundImage: profileData.coverPhotoUrl 
            ? `url(${profileData.coverPhotoUrl})` 
            : 'linear-gradient(135deg, #4389f5 0%, #5c42f5 100%)' 
        }}
      >
        {isOwnProfile && (isCoverHovered || isUploadingCover) && (
          <button 
            className={`${styles.editCoverBtn} ${isUploadingCover ? styles.loading : ''}`}
            onClick={handleCoverClick}
            disabled={isUploadingCover}
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

      <div className={styles.profileContent}>
        {/* Avatar */}
        <div className={styles.avatarContainer}>
          <div
            className={`${styles.avatarWrapper} ${isUploadingAvatar ? styles.loading : ''}`}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            onClick={handleProfilePictureClick}
            onKeyPress={handleKeyPress(handleProfilePictureClick)}
            tabIndex={isOwnProfile ? 0 : -1}
            role={isOwnProfile ? 'button' : undefined}
          >
            {profileData.profilePictureUrl ? (
              <img 
                src={profileData.profilePictureUrl} 
                alt={`${profileData.firstName} ${profileData.lastName}`}
                className={styles.avatar}
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
                    <FaCamera />
                    <span>Thay đổi ảnh</span>
                  </>
                )}
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

        {/* Profile Info */}
        <div className={styles.profileInfo}>
          <h1 className={styles.fullName}>
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

          <p className={styles.bio}>
            {profileData.bio || 'Chưa có thông tin giới thiệu.'}
          </p>

          <p className={styles.joinDate}>
            Thành viên từ {formattedDate}
          </p>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat} onClick={onShowFollowers}>
              <span className={styles.statValue}>{profileData.followersCount}</span>
              <span className={styles.statLabel}>Người theo dõi</span>
            </div>
            
            <div className={styles.stat} onClick={onShowFollowing}>
              <span className={styles.statValue}>{profileData.followingCount}</span>
              <span className={styles.statLabel}>Đang theo dõi</span>
            </div>
            
            <div className={styles.stat} onClick={onTogglePosts}>
              <span className={styles.statValue}>{profileData.postCount}</span>
              <span className={styles.statLabel}>Bài viết</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            {isOwnProfile ? (
              <>
                <button className={styles.btnPrimary} onClick={onToggleEditing}>
                  <FaEdit /> Chỉnh sửa hồ sơ
                </button>
                <button className={styles.btnSecondary} onClick={onTogglePasswordChange}>
                  <FaKey /> Đổi mật khẩu
                </button>
              </>
            ) : user && (
              <>
                <button
                  className={profileData.isFollowing ? styles.btnFollowing : styles.btnFollow}
                  onClick={profileData.isFollowing ? onUnfollowUser : onFollowUser}
                >
                  {profileData.isFollowing ? (
                    <>
                      <FaUserCheck /> Đang theo dõi
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Theo dõi
                    </>
                  )}
                </button>
                <button className={styles.btnSecondary}>
                  <FaEnvelope /> Nhắn tin
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  profileData: PropTypes.object,
  isOwnProfile: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onFollowUser: PropTypes.func.isRequired,
  onUnfollowUser: PropTypes.func.isRequired,
  onShowFollowers: PropTypes.func.isRequired,
  onShowFollowing: PropTypes.func.isRequired,
  onTogglePosts: PropTypes.func.isRequired,
  onToggleEditing: PropTypes.func.isRequired,
  onTogglePasswordChange: PropTypes.func.isRequired,
  onProfileUpdated: PropTypes.func.isRequired
};

export default ProfileHeader;
