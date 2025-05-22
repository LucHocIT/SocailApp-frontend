import { useNavigate } from 'react-router-dom';
import styles from './UserList.module.scss';

const UserList = ({ users, emptyMessage }) => {
  const navigate = useNavigate();
  
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
    return (
    <>
      {users.length === 0 ? (
        <p className={styles.emptyList}>{emptyMessage}</p>
      ) : (
        <ul className={styles.userList}>
          {users.map(user => (
            <li key={user.id} className={styles.userItem}>
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
              <div className={styles.userInfo}>
                <h3 className={styles.userName}>{user.firstName} {user.lastName}</h3>
                <p className={styles.userBio}>@{user.username}</p>
              </div>
              <button 
                className={styles.viewProfileButton}
                onClick={() => handleViewProfile(user.id)}
              >
                Xem hồ sơ
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default UserList;
