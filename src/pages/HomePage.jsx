import { useAuth } from '../context';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <main className="content">
        {user ? (
          <div className="dashboard">
            <h2>Bảng điều khiển</h2>
            <div className="user-profile">
              <h3>Thông tin người dùng</h3>
              <div className="profile-info">
                <p><strong>Tên đăng nhập:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Họ và tên:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Vai trò:</strong> {user.role}</p>
                <p><strong>Hoạt động lần cuối:</strong> {new Date(user.lastActive).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="welcome">
            <h2>Chào mừng đến với SocialApp</h2>
            <p>Đăng nhập hoặc Đăng ký để bắt đầu.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
