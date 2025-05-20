import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here we would normally call an API to update the profile
    // For now, just show a success message
    toast.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  };

  if (!user) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image">
          {user.profilePictureUrl ? (
            <img src={user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
          ) : (
            <div className="default-avatar">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1>{user.firstName} {user.lastName}</h1>
          <p className="username">@{user.username}</p>
          {!isEditing && (
            <p className="bio">{user.bio || 'Chưa có thông tin giới thiệu.'}</p>
          )}
          <button 
            className="btn btn-edit"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Hủy' : 'Chỉnh sửa thông tin'}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="profile-edit">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">Họ</label>
              <input 
                type="text" 
                name="firstName" 
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
                value={profile.lastName} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Giới thiệu</label>
              <textarea 
                name="bio" 
                value={profile.bio} 
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              Lưu thay đổi
            </button>
          </form>
        </div>
      )}

      <div className="profile-details">
        <h2>Thông tin chi tiết</h2>
        <div className="detail-item">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{user.email}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Ngày tham gia:</span>
          <span className="detail-value">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Hoạt động lần cuối:</span>
          <span className="detail-value">{new Date(user.lastActive).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
