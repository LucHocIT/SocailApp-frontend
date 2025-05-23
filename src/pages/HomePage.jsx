import { useAuth } from '../context';
import { useEffect, useState } from 'react';
import { FaUsers, FaComments, FaHeart, FaShare } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CreatePost from '../components/post/CreatePost';
import PostList from '../components/post/PostList';

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

  const [newPost, setNewPost] = useState(null);

  const handlePostCreated = (post) => {
    setNewPost(post);
  };

  return (
    <div className="home-container">
      <main className="content">
        {user ? (
          <div className="post-only-container">
            <h2 data-aos="fade-right">Bảng tin</h2>
            <div className="feed-container">
              <CreatePost onPostCreated={handlePostCreated} />
              <PostList key={newPost?.id} username="" onlyFollowing={false} />
            </div>
          </div>
        ) : (
          <>
            <div className="hero-section">
              <div className="hero-text">
                <h1 data-aos="fade-down">Chào mừng đến với SocialApp</h1>
                <p data-aos="fade-up" data-aos-delay="100">Kết nối với bạn bè, chia sẻ khoảnh khắc và khám phá thế giới mới!</p>
                <div className="action-buttons">
                  <button onClick={openLoginModal} className="login-button" data-aos="fade-right" data-aos-delay="200">
                    Đăng nhập
                  </button>
                  <button onClick={openRegisterModal} className="register-button" data-aos="fade-left" data-aos-delay="300">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
            {/* Features Section */}
            <div className="cta-section">
              <h2 data-aos="fade-up">Tính năng nổi bật</h2>
              <p data-aos="fade-up">Khám phá những tính năng tuyệt vời mà SocialApp mang lại cho bạn</p>
              <div className="feature-grid">
                <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
                  <span className="icon">
                    <FaUsers />
                  </span>
                  <h3>Kết nối bạn bè</h3>
                  <p>Dễ dàng kết nối với bạn bè và những người có cùng sở thích từ khắp nơi trên thế giới.</p>
                </div>
                <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
                  <span className="icon">
                    <FaComments />
                  </span>
                  <h3>Trò chuyện trực tiếp</h3>
                  <p>Giao tiếp ngay lập tức với bạn bè của bạn thông qua các tin nhắn và cuộc trò chuyện nhóm.</p>
                </div>
                <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
                  <span className="icon">
                    <FaHeart />
                  </span>
                  <h3>Chia sẻ khoảnh khắc</h3>
                  <p>Chia sẻ những khoảnh khắc đặc biệt của bạn với hình ảnh, video và bài đăng hấp dẫn.</p>
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
