import { useAuth } from '../context';
import { useEffect } from 'react';
import { FaUsers, FaComments, FaHeart, FaShare } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './HomePage.scss';

const HomePage = () => {
  const { user, openLoginModal, openRegisterModal } = useAuth();

  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true
    });
  }, []);

  return (
    <div className="home-container">
      <main className="content">
        {user ? (
          <div className="dashboard">
            <h2 data-aos="fade-right">Bảng điều khiển</h2>
            <div className="user-profile" data-aos="fade-up">
              <h3>Thông tin người dùng</h3>
              <div className="profile-info">
                <p><strong>Tên đăng nhập:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Họ và tên:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Vai trò:</strong> {user.role}</p>
                <p><strong>Hoạt động lần cuối:</strong> {new Date(user.lastActive).toLocaleString()}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card" data-aos="zoom-in" data-aos-delay="100">
                <div className="icon icon-primary">
                  <FaUsers />
                </div>
                <h4>125</h4>
                <p>Followers</p>
              </div>
              <div className="stat-card" data-aos="zoom-in" data-aos-delay="200">
                <div className="icon icon-success">
                  <FaComments />
                </div>
                <h4>348</h4>
                <p>Comments</p>
              </div>
              <div className="stat-card" data-aos="zoom-in" data-aos-delay="300">
                <div className="icon icon-warning">
                  <FaHeart />
                </div>
                <h4>523</h4>
                <p>Likes</p>
              </div>
              <div className="stat-card" data-aos="zoom-in" data-aos-delay="400">
                <div className="icon icon-info">
                  <FaShare />
                </div>
                <h4>42</h4>
                <p>Shares</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="welcome">
              <div className="hero-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
              </div>
              <h2 data-aos="fade-down">Chào mừng đến với SocialApp</h2>
              <p data-aos="fade-up" data-aos-delay="100">Kết nối với bạn bè, chia sẻ khoảnh khắc và khám phá thế giới mới!</p>
              <div className="hero-buttons">
                <button onClick={openLoginModal} className="btn btn-white shadow-hover" data-aos="fade-right" data-aos-delay="200">
                  Đăng nhập
                </button>
                <button onClick={openRegisterModal} className="btn btn-outline-white shadow-hover" data-aos="fade-left" data-aos-delay="300">
                  Đăng ký ngay
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
              <div className="section-title" data-aos="fade-up">
                <h2>Tính năng nổi bật</h2>
                <p>Khám phá những tính năng tuyệt vời mà SocialApp mang lại cho bạn</p>
              </div>
              <div className="features-grid">
                <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
                  <div className="feature-icon">
                    <FaUsers />
                  </div>
                  <div className="feature-content">
                    <h3>Kết nối bạn bè</h3>
                    <p>Dễ dàng kết nối với bạn bè và những người có cùng sở thích từ khắp nơi trên thế giới.</p>
                  </div>
                </div>
                <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
                  <div className="feature-icon">
                    <FaComments />
                  </div>
                  <div className="feature-content">
                    <h3>Trò chuyện trực tiếp</h3>
                    <p>Giao tiếp ngay lập tức với bạn bè của bạn thông qua các tin nhắn và cuộc trò chuyện nhóm.</p>
                  </div>
                </div>
                <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
                  <div className="feature-icon">
                    <FaHeart />
                  </div>
                  <div className="feature-content">
                    <h3>Chia sẻ khoảnh khắc</h3>
                    <p>Chia sẻ những khoảnh khắc đặc biệt của bạn với hình ảnh, video và bài đăng hấp dẫn.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
