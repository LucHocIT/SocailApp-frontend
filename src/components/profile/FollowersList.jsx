import { useState, useEffect } from 'react';
import { useProfile } from '../../context';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaUserCheck, FaUserPlus, FaTimes } from 'react-icons/fa';


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
    <div className="followers-list-container">
      <div className="followers-header">
        <h3>{title}</h3>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>
            {type === 'followers' 
              ? 'Chưa có người theo dõi nào.' 
              : 'Chưa theo dõi ai.'}
          </p>
        </div>
      ) : (
        <ul className="followers-list">
          {users.map(user => (
            <li key={user.id} className="follower-item">
              <div className="follower-info">
                <Link to={`/profile/${user.username}`} className="follower-avatar">
                  <img 
                    src={user.profilePictureUrl || '/images/default-avatar.png'} 
                    alt={user.username}
                  />
                </Link>
                <div className="follower-details">
                  <Link to={`/profile/${user.username}`} className="follower-name">
                    {user.firstName} {user.lastName}
                    {user.isVerified && <span className="verified-badge">✓</span>}
                  </Link>
                  <p className="follower-username">@{user.username}</p>
                </div>
              </div>
              
              {user.isSelf ? null : (
                <button 
                  className={`follow-button ${user.isFollowing ? 'following' : ''}`}
                  onClick={() => handleFollowToggle(user)}
                >
                  {user.isFollowing ? (
                    <>
                      <FaUserCheck />
                      <span className="follow-text">Đang theo dõi</span>
                      <span className="unfollow-text">Bỏ theo dõi</span>
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
