import { useAuth, useProfile } from '../context';
import { useState, useEffect } from 'react';
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
  FollowingModal 
} from '../components/profile';

const ProfilePage = () => {
  const { user } = useAuth();
  const { 
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getUserProfile
  } = useProfile();
  
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
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
  });  const [loading, setLoading] = useState(true);
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
        
        console.log('Fetching profile for user ID:', targetUserId);
        
        // Fetch profile data
        const data = await getUserProfile(targetUserId);
        console.log('Profile data received:', data);
        setProfileData(data);
        
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
          const followersData = await getFollowers(targetUserId);
          setFollowers(followersData);
        } catch (error) {
          console.error('Error fetching followers:', error);
          setFollowers([]);
        }
        
        try {
          const followingData = await getFollowing(targetUserId);
          setFollowing(followingData);
        } catch (error) {
          console.error('Error fetching following:', error);
          setFollowing([]);
        }
      } catch (error) {
        toast.error(error.message || 'Có lỗi xảy ra khi tải hồ sơ');
      } finally {
        setLoading(false);
      }
    };    
    
    fetchProfileData();
  }, [userId, user, navigate, getUserProfile, getFollowers, getFollowing]);

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

  const handleProfileUpdated = (updatedData) => {
    setProfileData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  if (!profileData && loading) {
    return <div className="loading">Đang tải thông tin hồ sơ...</div>;
  }

  if (!profileData && !loading) {
    return <div className="error">Không thể tải thông tin hồ sơ người dùng này</div>;
  }
  return (
    <div className={styles.profileContainer}>      <ProfileHeader 
        profileData={profileData}
        isOwnProfile={isOwnProfile}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
        onShowFollowers={() => setShowFollowers(true)}
        onShowFollowing={() => setShowFollowing(true)}
        onTogglePosts={() => setShowPosts(prev => !prev)}
        onToggleEditing={() => setIsEditing(!isEditing)}
        onTogglePasswordChange={() => setIsChangingPassword(!isChangingPassword)}
        isEditing={isEditing}
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
      )}      {!isEditing && !isChangingPassword && profileData && showPosts && (
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