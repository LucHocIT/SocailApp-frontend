import React, { useState, useEffect } from 'react';
import { useAuth, useProfile } from '../context/hooks';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaUserFriends, 
  FaUserPlus, 
  FaSearch, 
  FaSpinner,
  FaUserCheck,
  FaComments,
  FaEye,
  FaTimes,
  FaHeart
} from 'react-icons/fa';
import styles from './Friends.module.scss';

const Friends = () => {
  const { user } = useAuth();
  const { getFollowers, getFollowing, followUser, unfollowUser } = useProfile();
  
  const [activeTab, setActiveTab] = useState('friends');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchFriendsData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const [followersData, followingData] = await Promise.all([
          getFollowers(user.id),
          getFollowing(user.id)
        ]);

        setFollowers(followersData || []);
        setFollowing(followingData || []);

        // Calculate mutual friends (people who follow you and you follow back)
        const followerIds = new Set((followersData || []).map(f => f.id));
        const mutual = (followingData || []).filter(f => followerIds.has(f.id));
        setMutualFriends(mutual);

      } catch (error) {
        console.error('Error fetching friends data:', error);
        toast.error('Không thể tải danh sách bạn bè');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsData();
  }, [user?.id, getFollowers, getFollowing]);

  // Filter data based on search term and active tab
  useEffect(() => {
    let data = [];
    
    switch (activeTab) {
      case 'friends':
        data = mutualFriends;
        break;
      case 'followers':
        data = followers;
        break;
      case 'following':
        data = following;
        break;
      default:
        data = [];
    }

    if (searchTerm.trim()) {
      data = data.filter(person => 
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(data);
  }, [activeTab, followers, following, mutualFriends, searchTerm]);

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      toast.success('Đã theo dõi thành công!');
      
      // Update local state
      const userToUpdate = followers.find(f => f.id === userId) || 
                          following.find(f => f.id === userId);
      
      if (userToUpdate) {
        // Add to following list if not already there
        const isAlreadyFollowing = following.some(f => f.id === userId);
        if (!isAlreadyFollowing) {
          setFollowing(prev => [...prev, { ...userToUpdate, isFollowing: true }]);
        }
        
        // Check if this creates a mutual friendship
        const isFollower = followers.some(f => f.id === userId);
        if (isFollower && !mutualFriends.some(f => f.id === userId)) {
          setMutualFriends(prev => [...prev, { ...userToUpdate, isFollowing: true }]);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Không thể theo dõi người dùng này');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      toast.success('Đã bỏ theo dõi thành công!');
      
      // Remove from following list
      setFollowing(prev => prev.filter(f => f.id !== userId));
      
      // Remove from mutual friends if exists
      setMutualFriends(prev => prev.filter(f => f.id !== userId));
      
    } catch (error) {
      toast.error(error.message || 'Không thể bỏ theo dõi người dùng này');
    }
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'friends':
        return { data: mutualFriends, count: mutualFriends.length };
      case 'followers':
        return { data: followers, count: followers.length };
      case 'following':
        return { data: following, count: following.length };
      default:
        return { data: [], count: 0 };
    }
  };

  const renderUserCard = (person) => {
    const isFollowing = following.some(f => f.id === person.id);
    const isMutualFriend = mutualFriends.some(f => f.id === person.id);
    
    return (
      <div key={person.id} className={styles.userCard}>
        <div className={styles.cardHeader}>
          <Link to={`/profile/${person.id}`} className={styles.avatarLink}>
            {person.profilePictureUrl ? (
              <img 
                src={person.profilePictureUrl} 
                alt={person.username}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {person.firstName?.charAt(0)}{person.lastName?.charAt(0)}
              </div>
            )}
          </Link>
          
          {isMutualFriend && (
            <div className={styles.friendBadge}>
              <FaHeart />
            </div>
          )}
        </div>

        <div className={styles.userInfo}>
          <Link to={`/profile/${person.id}`} className={styles.nameLink}>
            <h3>{person.firstName} {person.lastName}</h3>
          </Link>
          <p className={styles.username}>@{person.username}</p>
          {person.bio && (
            <p className={styles.bio}>{person.bio}</p>
          )}
          
          <div className={styles.stats}>
            <span>{person.followersCount || 0} người theo dõi</span>
            <span>{person.followingCount || 0} đang theo dõi</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to={`/profile/${person.id}`} className={styles.viewButton}>
            <FaEye />
            Xem hồ sơ
          </Link>
          
          {activeTab !== 'following' ? (
            <button 
              onClick={() => handleFollow(person.id)}
              className={styles.followButton}
              disabled={isFollowing}
            >
              {isFollowing ? (
                <>
                  <FaUserCheck />
                  Đang theo dõi
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Theo dõi
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={() => handleUnfollow(person.id)}
              className={styles.unfollowButton}
            >
              <FaTimes />
              Bỏ theo dõi
            </button>
          )}
          
          <Link to="/chat" className={styles.chatButton}>
            <FaComments />
            Nhắn tin
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.friendsPage}>
        <div className={styles.loading}>
          <FaSpinner className={styles.spinner} />
          <p>Đang tải danh sách bạn bè...</p>
        </div>
      </div>
    );  }

  const { count: currentCount } = getTabData();

  return (
    <div className={styles.friendsPage}>
      <div className={styles.header}>
        <h1>
          <FaUsers />
          Bạn bè
        </h1>
        <p>Quản lý danh sách bạn bè và người theo dõi của bạn</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <FaUserFriends />
          Bạn bè
          <span className={styles.count}>{mutualFriends.length}</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'followers' ? styles.active : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          <FaUsers />
          Người theo dõi
          <span className={styles.count}>{followers.length}</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'following' ? styles.active : ''}`}
          onClick={() => setActiveTab('following')}
        >
          <FaUserPlus />
          Đang theo dõi
          <span className={styles.count}>{following.length}</span>
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInput}>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredData.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {activeTab === 'friends' && <FaUserFriends />}
              {activeTab === 'followers' && <FaUsers />}
              {activeTab === 'following' && <FaUserPlus />}
            </div>
            <h2>
              {searchTerm 
                ? 'Không tìm thấy kết quả'
                : activeTab === 'friends' 
                  ? 'Chưa có bạn bè'
                  : activeTab === 'followers'
                    ? 'Chưa có người theo dõi'
                    : 'Chưa theo dõi ai'
              }
            </h2>
            <p>
              {searchTerm 
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : activeTab === 'friends'
                  ? 'Hãy bắt đầu kết nối với mọi người để có thêm bạn bè!'
                  : activeTab === 'followers'
                    ? 'Chia sẻ nội dung hay để thu hút người theo dõi!'
                    : 'Tìm và theo dõi những người bạn quan tâm!'
              }
            </p>
          </div>
        ) : (
          <>
            <div className={styles.resultsHeader}>
              <p>
                {searchTerm 
                  ? `Tìm thấy ${filteredData.length} kết quả cho "${searchTerm}"`
                  : `${currentCount} ${
                      activeTab === 'friends' ? 'bạn bè' : 
                      activeTab === 'followers' ? 'người theo dõi' : 'người đang theo dõi'
                    }`
                }
              </p>
            </div>
            
            <div className={styles.userGrid}>
              {filteredData.map(renderUserCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;
