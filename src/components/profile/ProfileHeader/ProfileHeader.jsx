import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProfile, useAuth } from '../../../context/hooks';
import { 
  FaCamera, FaShieldAlt, FaEdit, FaKey, 
  FaEnvelope, FaUserCheck, FaUserPlus, 
  FaSpinner, FaUser, FaList, FaCalendarAlt,
  FaBirthdayCake, FaMapMarkerAlt, FaGlobe,
  FaChevronDown, FaChevronUp, FaInfoCircle,
  FaCog, FaSignOutAlt
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import styles from './ProfileHeader.module.scss';
import ImageCropperModal from '../ImageCropper';
import BlockUserButton from '../../user/BlockUserButton';
import BlockStatusIndicator from '../../user/BlockStatusIndicator';
import chatService from '../../../services/chatService';

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
  onToggleSettings,
  onProfileUpdated
}) => {
const { user, logout } = useAuth();
  const { uploadCroppedProfilePicture } = useProfile();
  const navigate = useNavigate();
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isCoverHovered, setIsCoverHovered] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const [isExpandedInfo, setIsExpandedInfo] = useState(false);
  // State mới cho tính năng cắt ảnh
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [isCropperForAvatar, setIsCropperForAvatar] = useState(true);

  const fileInputRef = useRef(null);
  const coverFileRef = useRef(null);

  useEffect(() => {
    if (profileData && profileData.createdAt) {
      const date = new Date(profileData.createdAt);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      setFormattedDate(date.toLocaleDateString('vi-VN', options));
    }
  }, [profileData]);

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

    // Tạo URL ảnh từ file và hiển thị cropper
    const imageUrl = URL.createObjectURL(file);
    setCropImageSrc(imageUrl);
    setIsCropperForAvatar(type === 'avatar');
    setShowCropper(true);
  };

  // Hàm xử lý khi hoàn thành cắt ảnh
  const handleCropComplete = async (croppedFile, cropData) => {
    const type = isCropperForAvatar ? 'avatar' : 'cover';
    const uploadStateSetter = type === 'avatar' ? setIsUploadingAvatar : setIsUploadingCover;
    
    try {
      uploadStateSetter(true);
      const response = await uploadCroppedProfilePicture(croppedFile, cropData);
      toast.success('Cập nhật ảnh thành công!');
      onProfileUpdated({
        [type === 'avatar' ? 'profilePictureUrl' : 'coverPhotoUrl']: response.profilePictureUrl
      });
    } catch (error) {
      toast.error(error.message || 'Tải lên ảnh thất bại!');
    } finally {
      // Đóng cropper và xóa URL tạm thời
      setShowCropper(false);
      setCropImageSrc(null);
      uploadStateSetter(false);
    }
  };
  // Hàm xử lý khi hủy cắt ảnh
  const handleCropCancel = () => {
    setShowCropper(false);
    setCropImageSrc(null);
    
    // Reset giá trị input file
    if (isCropperForAvatar) {
      fileInputRef.current.value = '';
    } else {
      coverFileRef.current.value = '';
    }
  };
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle message/chat
  const handleStartChat = async () => {
    if (!user || !profileData) {
      toast.error('Vui lòng đăng nhập để nhắn tin');
      return;
    }

    try {
      // Tạo hoặc lấy conversation với user này
      const conversation = await chatService.getOrCreateConversation(profileData.id);
      
      // Chuyển hướng đến trang chat với conversation được chọn
      navigate('/chat', { 
        state: { 
          selectedConversationId: conversation.id,
          otherUser: {
            id: profileData.id,
            name: `${profileData.firstName} ${profileData.lastName}`,
            avatar: profileData.profilePictureUrl
          }
        } 
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      if (error.response?.status === 400) {
        toast.error('Bạn chỉ có thể nhắn tin với bạn bè (người theo dõi lẫn nhau)');
      } else {
        toast.error('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại sau.');
      }
    }
  };

  const handleKeyPress = (handler) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handler(e);
    }
  };

  // Hiển thị trạng thái loading khi đang tải thông tin profile
  if (loading && !showCropper) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <FaSpinner />
        </div>
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileHeader}>
      {/* Image Cropper Modal */}
      {showCropper && cropImageSrc && (
        <ImageCropperModal
          image={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={isCropperForAvatar ? 1 : 16/9}
          circularCrop={isCropperForAvatar}
        />
      )}

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
        <div className={styles.profileInfo}>          <h1 className={styles.fullName}>
            {profileData.firstName} {profileData.lastName}
            {profileData.isVerified && (
              <span className={styles.verifiedIconWrapper} title="Tài khoản đã xác thực">
                <FaShieldAlt className={styles.verifiedIcon} />
                <span className={styles.verifiedTooltip}>Tài khoản đã xác thực</span>
              </span>
            )}
            {!isOwnProfile && user && (
              <BlockStatusIndicator 
                userId={profileData.id} 
                variant="badge"
                className={styles.blockStatusBadge}
              />
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
          </p>          <div className={styles.profileMeta}>
            <p className={styles.joinDate}>
              <FaCalendarAlt /> Thành viên từ {formattedDate}
            </p>
            
            {profileData.location && (
              <p className={styles.location}>
                <FaMapMarkerAlt /> {profileData.location}
              </p>
            )}
          </div>
          
          <button 
            className={styles.toggleInfoBtn} 
            onClick={() => setIsExpandedInfo(prev => !prev)}
            aria-label={isExpandedInfo ? "Ẩn thông tin chi tiết" : "Hiển thị thông tin chi tiết"}
          >
            <FaInfoCircle />
            <span>{isExpandedInfo ? "Ẩn thông tin chi tiết" : "Hiển thị thêm thông tin"}</span>
            {isExpandedInfo ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          
          {isExpandedInfo && (
            <div className={styles.expandedInfo}>
              {profileData.birthday && (
                <div className={styles.infoItem}>
                  <FaBirthdayCake />
                  <span>Sinh nhật: {new Date(profileData.birthday).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              
              {profileData.website && (
                <div className={styles.infoItem}>
                  <FaGlobe />
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                    {profileData.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}
              
              {profileData.email && isOwnProfile && (
                <div className={styles.infoItem}>
                  <FaEnvelope />
                  <span>{profileData.email}</span>
                </div>
              )}
            </div>
          )}

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
          </div>          {/* Action Buttons */}          <div className={styles.actionButtons}>
            {isOwnProfile ? (
              <>
                <button className={styles.btnPrimary} onClick={onToggleEditing}>
                  <FaEdit /> Chỉnh sửa hồ sơ
                </button>
                <button className={styles.btnSecondary} onClick={onTogglePasswordChange}>
                  <FaKey /> Đổi mật khẩu
                </button>
                <button className={styles.btnSecondary} onClick={onToggleSettings}>
                  <FaCog /> Cài đặt
                </button>
                <button 
                  className={styles.logoutButton}
                  onClick={handleLogout}
                  title="Đăng xuất"
                >
                  <FaSignOutAlt />
                </button>
              </>            ) : user && (
              <>                <button
                  className={profileData.isFollowing || profileData.isFollowedByCurrentUser ? styles.btnFollowing : styles.btnFollow}
                  onClick={profileData.isFollowing || profileData.isFollowedByCurrentUser ? onUnfollowUser : onFollowUser}
                >
                  {profileData.isFollowing || profileData.isFollowedByCurrentUser ? (
                    <>
                      <FaUserCheck /> Bỏ theo dõi
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Theo dõi
                    </>
                  )}
                </button>                <button 
                  className={styles.btnSecondary} 
                  onClick={handleStartChat}
                >
                  <FaEnvelope /> Nhắn tin
                </button>
                <BlockUserButton 
                  userId={profileData.id}
                  userName={`${profileData.firstName} ${profileData.lastName}`}
                  variant="secondary"
                  size="medium"
                />              </>
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
  onToggleSettings: PropTypes.func.isRequired,
  onProfileUpdated: PropTypes.func.isRequired
};

export default ProfileHeader;
