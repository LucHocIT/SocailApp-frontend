import { useNavigate } from 'react-router-dom';

const UserList = ({ users, emptyMessage }) => {
  const navigate = useNavigate();
  
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
  
  return (
    <>
      {users.length === 0 ? (
        <p className="empty-list">{emptyMessage}</p>
      ) : (
        <ul className="user-list">
          {users.map(user => (
            <li key={user.id} className="user-item">
              <div className="user-avatar">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.username} />
                ) : (
                  <div className="default-avatar small">
                    {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                  </div>
                )}
              </div>
              <div className="user-info">
                <h3>{user.firstName} {user.lastName}</h3>
                <p>@{user.username}</p>
              </div>
              <button 
                className="btn btn-sm"
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
