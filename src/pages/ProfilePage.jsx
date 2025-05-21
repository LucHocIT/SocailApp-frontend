import { useAuth, useProfile } from '../context';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();  const { 
    updateProfile, 
    uploadProfilePicture, 
    removeProfilePicture, 
    changePassword,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getUserProfile
  } = useProfile();
  const { userId } = useParams(); // For viewing other user's profile
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Determine if viewing own profile or another user's profile
        const targetUserId = userId ? parseInt(userId, 10) : user?.id;
        setIsOwnProfile(!userId || (user && targetUserId === user.id));
        
        if (!targetUserId) {
          navigate('/login');
          return;
        }
        
        // Fetch profile data
        const data = await getUserProfile(targetUserId);
        setProfileData(data);
        
        // Initialize form if it's own profile
        if (!userId || (user && targetUserId === user.id)) {
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            bio: data.bio || ''
          });
        }
        
        // Fetch followers and following
        const followersData = await getFollowers(targetUserId);
        const followingData = await getFollowing(targetUserId);
        setFollowers(followersData);
        setFollowing(followingData);
      } catch (error) {
        toast.error(error.message || 'Có lỗi xảy ra khi tải hồ sơ');
      } finally {
        setLoading(false);
      }
    };    
    fetchProfileData();
  }, [userId, user, navigate, getUserProfile, getFollowers, getFollowing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile);
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      // Update profileData state to reflect changes
      setProfileData(prev => ({
        ...prev,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio
      }));
    } catch (error) {
      toast.error(error.message || 'Cập nhật thông tin thất bại!');
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp!');
      return;
    }
    
    try {
      await changePassword(passwordData);
      toast.success('Đổi mật khẩu thành công!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Đổi mật khẩu thất bại!');
    }
  };
  
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
      
      // Update profileData state to reflect changes
      setProfileData(prev => ({
        ...prev,
        profilePictureUrl: response.profilePictureUrl
      }));
    } catch (error) {
      toast.error(error.message || 'Tải lên ảnh đại diện thất bại!');
    }
  };
  
  const handleRemoveProfilePicture = async () => {
    try {
      await removeProfilePicture();
      toast.success('Đã xóa ảnh đại diện!');
      
      // Update profileData state to reflect changes
      setProfileData(prev => ({
        ...prev,
        profilePictureUrl: null
      }));
    } catch (error) {
      toast.error(error.message || 'Xóa ảnh đại diện thất bại!');
    }
  };
    const handleFollow = async () => {
    try {
      await followUser(profileData.id);
      toast.success(`Đã theo dõi ${profileData.firstName} ${profileData.lastName}`);
      
      // Update UI
      setProfileData(prev => ({
        ...prev,
        isFollowing: true,
        followersCount: prev.followersCount + 1
      }));
    } catch (error) {
      toast.error(error.message || 'Không thể theo dõi người dùng này');
    }
  };
  const handleUnfollow = async () => {
    try {
      await unfollowUser(profileData.id);
      toast.success(`Đã bỏ theo dõi ${profileData.firstName} ${profileData.lastName}`);
      
      // Update UI
      setProfileData(prev => ({
        ...prev,
        isFollowing: false,
        followersCount: prev.followersCount - 1
      }));
    } catch (error) {
      toast.error(error.message || 'Không thể bỏ theo dõi người dùng này');
    }
  };

  if (!profileData && loading) {
    return <div className="loading">Đang tải thông tin hồ sơ...</div>;
  }

  if (!profileData && !loading) {
    return <div className="error">Không thể tải thông tin hồ sơ người dùng này</div>;
  }

  return (
    <div className="profile-container">
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
            <div className="stat" onClick={() => setShowFollowers(true)}>
              <span className="count">{profileData.followersCount}</span>
              <span className="label">Người theo dõi</span>
            </div>
            <div className="stat" onClick={() => setShowFollowing(true)}>
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
                  onClick={() => setIsEditing(!isEditing)}
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
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? 'Hủy' : 'Đổi mật khẩu'}
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

      {isEditing && (
        <div className="profile-edit">
          <h2>Chỉnh sửa thông tin cá nhân</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="firstName">Họ</label>
              <input 
                type="text" 
                name="firstName" 
                id="firstName"
                value={profile.firstName} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Tên</label>
              <input 
                type="text" 
                name="lastName" 
                id="lastName"
                value={profile.lastName} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Giới thiệu</label>
              <textarea 
                name="bio" 
                id="bio"
                value={profile.bio} 
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Lưu thay đổi
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {isChangingPassword && (
        <div className="password-change">
          <h2>Đổi mật khẩu</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                name="currentPassword" 
                id="currentPassword"
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input 
                type="password" 
                name="newPassword" 
                id="newPassword"
                value={passwordData.newPassword} 
                onChange={handlePasswordChange}
                className="form-control"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                name="confirmPassword" 
                id="confirmPassword"
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange}
                className="form-control"
                required
                minLength="6"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Đổi mật khẩu
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setIsChangingPassword(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {showFollowers && (
        <div className="modal followers-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Người theo dõi</h2>
              <button className="close-btn" onClick={() => setShowFollowers(false)}>×</button>
            </div>
            <div className="modal-body">
              {followers.length === 0 ? (
                <p className="empty-list">Chưa có người theo dõi nào.</p>
              ) : (
                <ul className="user-list">
                  {followers.map(follower => (
                    <li key={follower.id} className="user-item">
                      <div className="user-avatar">
                        {follower.profilePictureUrl ? (
                          <img src={follower.profilePictureUrl} alt={follower.username} />
                        ) : (
                          <div className="default-avatar small">
                            {follower.firstName?.charAt(0) || ''}{follower.lastName?.charAt(0) || ''}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h3>{follower.firstName} {follower.lastName}</h3>
                        <p>@{follower.username}</p>
                      </div>
                      <button className="btn btn-sm">Xem hồ sơ</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="modal following-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Đang theo dõi</h2>
              <button className="close-btn" onClick={() => setShowFollowing(false)}>×</button>
            </div>
            <div className="modal-body">
              {following.length === 0 ? (
                <p className="empty-list">Chưa theo dõi ai.</p>
              ) : (
                <ul className="user-list">
                  {following.map(follow => (
                    <li key={follow.id} className="user-item">
                      <div className="user-avatar">
                        {follow.profilePictureUrl ? (
                          <img src={follow.profilePictureUrl} alt={follow.username} />
                        ) : (
                          <div className="default-avatar small">
                            {follow.firstName?.charAt(0) || ''}{follow.lastName?.charAt(0) || ''}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h3>{follow.firstName} {follow.lastName}</h3>
                        <p>@{follow.username}</p>
                      </div>
                      <button className="btn btn-sm">Xem hồ sơ</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
