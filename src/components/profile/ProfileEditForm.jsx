import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProfile } from '../../context';
import './PasswordEditForm.scss';

const ProfileEditForm = ({ profile: initialProfile, onCancel, onProfileUpdated }) => {
  const { updateProfile } = useProfile();
  const [profile, setProfile] = useState(initialProfile);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Đảm bảo gửi đủ trường bắt buộc theo UpdateProfileDTO ở backend
      const updatedProfile = {
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio
      };
      
      await updateProfile(updatedProfile);
      toast.success('Cập nhật thông tin thành công!');
      onProfileUpdated({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio
      });
      onCancel();
    } catch (error) {
      toast.error(error.message || 'Cập nhật thông tin thất bại!');
    }
  };
  
  return (
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
            onClick={onCancel}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;
