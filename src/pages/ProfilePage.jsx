import { useAuth, useProfile } from '../context/hooks';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaCamera, FaCheckCircle, FaUser, FaLock, FaList } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './ProfilePage.module.scss';
import PostList from '../components/post/PostList';

// Import the extracted components
import { 
  ProfileHeader, 
  ProfileEditForm, 
  PasswordChangeForm, 
  FollowersModal, 
  FollowingModal,
  ProfileSettingsSection
} from '../components/profile';

const ProfilePage = () => {
  const { user } = useAuth();
  const { 
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getUserProfile,
    getUserProfileByUsername
  } = useProfile();
  const { userId } = useParams();
  const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);

  // Use ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);  // Use ref for profile actions to prevent infinite loops
  const profileActionsRef = useRef({ getFollowers, getFollowing, getUserProfile });
  // Update profile actions ref when they change
  useEffect(() => {
    profileActionsRef.current = { getFollowers, getFollowing, getUserProfile, getUserProfileByUsername };
  }, [getFollowers, getFollowing, getUserProfile, getUserProfileByUsername]);
  
  // Fetch profile data with useCallback to prevent unnecessary recreation
  const fetchProfileData = useCallback(async () => {
    // If already fetching, don't start another fetch
    if (isFetchingRef.current) return;
    
    setLoading(true);
    isFetchingRef.current = true;
    
    try {
      // If we're on /profile with no userId parameter, we need to be logged in
      if (!userId && !user) {
        navigate('/');
        return;
      }

      let data;
      let targetUserId;

      // Check if userId is a number (ID) or string (username)
      const isNumericId = /^\d+$/.test(userId);
      
      if (!userId) {
        // Viewing own profile
        targetUserId = user?.id;
        data = await profileActionsRef.current.getUserProfile(targetUserId);
      } else if (isNumericId) {
        // userId is a numeric ID
        targetUserId = parseInt(userId, 10);
        data = await profileActionsRef.current.getUserProfile(targetUserId);
      } else {
        // userId is a username
        data = await profileActionsRef.current.getUserProfileByUsername(userId);
        targetUserId = data.id;
      }

      // Check if viewing own profile
      setIsOwnProfile(!userId || (user && targetUserId === user.id));      if (!data) {
        navigate('/');
        return;
      }
        // Ensure both isFollowing and isFollowedByCurrentUser are set correctly
      // This handles both fields to ensure compatibility with either field name
      const updatedData = {
        ...data,
        isFollowing: data.isFollowedByCurrentUser || data.isFollowing || false,
        isFollowedByCurrentUser: data.isFollowedByCurrentUser || data.isFollowing || false,
      };
      
      setProfileData(updatedData);

      // Initialize form if it's own profile
      if (!userId || (user && targetUserId === user.id)) {
        setProfile({
          username: data.username || '',
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          bio: data.bio || ''
        });
      }

      // Fetch followers and following
      try {
        const [followersData, followingData] = await Promise.all([
          profileActionsRef.current.getFollowers(targetUserId),
          profileActionsRef.current.getFollowing(targetUserId)
        ]);

        setFollowers(followersData || []);
        setFollowing(followingData || []);
      } catch (error) {
        console.error('Error fetching followers/following:', error);
        setFollowers([]);
        setFollowing([]);
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tải hồ sơ');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, user, navigate]); // Only depend on stable values

  // Effect to fetch profile data
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);  const handleFollow = async () => {
    try {
      const response = await followUser(profileData.id);
      toast.success(`Đã theo dõi ${profileData.firstName} ${profileData.lastName}`);
        // Update UI using the response data if available
      setProfileData(prev => ({
        ...prev,
        isFollowing: response.isFollowing || true,
        isFollowedByCurrentUser: response.isFollowedByCurrentUser || true,
        followersCount: prev.followersCount + 1
      }));
    } catch (error) {
      toast.error(error.message || 'Không thể theo dõi người dùng này');
    }
  };
    const handleUnfollow = async () => {
    try {
      const response = await unfollowUser(profileData.id);
      toast.success(`Đã bỏ theo dõi ${profileData.firstName} ${profileData.lastName}`);
        // Update UI using the response data if available
      setProfileData(prev => ({
        ...prev,
        isFollowing: response.isFollowing !== undefined ? response.isFollowing : false,
        isFollowedByCurrentUser: response.isFollowedByCurrentUser !== undefined ? response.isFollowedByCurrentUser : false,
        followersCount: prev.followersCount - 1
      }));
    } catch (error) {
      toast.error(error.message || 'Không thể bỏ theo dõi người dùng này');
    }
  };

  const handleProfileUpdated = (updatedData) => {
    setProfileData(prev => ({
      ...prev,
      ...updatedData
    }));
  };
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy hồ sơ người dùng</h2>
        <p>Người dùng này có thể không tồn tại hoặc đã bị xóa.</p>
        <button onClick={() => navigate('/')} className={styles.returnHomeButton}>
          Quay về trang chủ
        </button>
      </div>
    );
  }return (
    <div className={styles.profileContainer}>      <ProfileHeader 
        profileData={profileData}
        isOwnProfile={isOwnProfile}
        loading={loading}
        onFollowUser={handleFollow}
        onUnfollowUser={handleUnfollow}
        onShowFollowers={() => setShowFollowers(true)}
        onShowFollowing={() => setShowFollowing(true)}
        onTogglePosts={() => setShowPosts(prev => !prev)}
        onToggleEditing={() => setIsEditing(!isEditing)}
        onTogglePasswordChange={() => setIsChangingPassword(!isChangingPassword)}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onProfileUpdated={handleProfileUpdated}
      />

      {isEditing && (
        <ProfileEditForm 
          profile={profile}
          onCancel={() => setIsEditing(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {isChangingPassword && (
        <PasswordChangeForm 
          onCancel={() => setIsChangingPassword(false)}
        />
      )}

      {showFollowers && (
        <FollowersModal 
          followers={followers}
          onClose={() => setShowFollowers(false)}
        />
      )}      {showFollowing && (
        <FollowingModal 
          following={following}
          onClose={() => setShowFollowing(false)}
        />
      )}

      {showSettings && isOwnProfile && (
        <ProfileSettingsSection 
          profileData={profileData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {!isEditing && !isChangingPassword && profileData && showPosts && (
        <div className={styles.userPostsSection}>
          <h2 className={styles.sectionTitle}>
            <FaList className={styles.sectionIcon} />
            {isOwnProfile ? 'Bài viết của bạn' : `Bài viết của ${profileData.username}`}
          </h2>
          <PostList username={profileData.username} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;