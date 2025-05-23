import { useState, useEffect } from 'react';
import { useProfile } from '../../context/hooks';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaUserCheck, FaUserPlus, FaTimes } from 'react-icons/fa';
import styles from './FollowersList.module.scss';


const FollowersList = ({ userId, type = 'followers', onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getFollowers, getFollowing, followUser, unfollowUser } = useProfile();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let data;
        
        if (type === 'followers') {
          data = await getFollowers(userId);
        } else {
          data = await getFollowing(userId);
        }
        
        setUsers(data || []);
      } catch (error) {
        setError(error.message || 'Không thể tải danh sách người dùng');
        toast.error('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [userId, type, getFollowers, getFollowing]);
  
  const handleFollowToggle = async (user) => {
    try {
      if (user.isFollowing) {
        await unfollowUser(user.id);
        toast.success(`Đã bỏ theo dõi ${user.username}`);
      } else {
        await followUser(user.id);
        toast.success(`Đã theo dõi ${user.username}`);
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, isFollowing: !u.isFollowing } 
          : u
      ));
    } catch (error) {
      toast.error(error.message || 'Không thể thực hiện thao tác');
    }
  };
  
  const title = type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi';
    return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyMessage}>
          <p>
            {type === 'followers' 
              ? 'Chưa có người theo dõi nào.' 
              : 'Chưa theo dõi ai.'}
          </p>
        </div>      ) : (
        <ul className={styles.usersList}>
          {users.map(user => (
            <li key={user.id} className={styles.userItem}>
              <div className={styles.userInfo}>
                <Link to={`/profile/${user.username}`}>
                  {user.profilePictureUrl ? (
                    <img 
                      src={user.profilePictureUrl} 
                      alt={user.username}
                      className={styles.profileImage}
                    />
                  ) : (
                    <div className={styles.defaultAvatar}>
                      {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                    </div>
                  )}
                </Link>
                <div className={styles.userDetails}>
                  <h3 className={styles.userName}>
                    <Link to={`/profile/${user.username}`}>
                      {user.firstName} {user.lastName}
                      {user.isVerified && <span className={styles.verifiedBadge}>✓</span>}
                    </Link>
                  </h3>
                  <p className={styles.userUsername}>@{user.username}</p>
                </div>
              </div>
              
              {user.isSelf ? null : (
                <button 
                  className={user.isFollowing ? styles.unfollowButton : styles.followButton}
                  onClick={() => handleFollowToggle(user)}
                >
                  {user.isFollowing ? (
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
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowersList;
