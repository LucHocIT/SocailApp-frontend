import { useAuth } from '../context';
import { useEffect, useState } from 'react';
import { FaUsers, FaComments, FaHeart, FaShare } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './HomePage.module.scss';
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
  }, []);  const [newPost, setNewPost] = useState(null);

  const handlePostCreated = (post) => {
    setNewPost(post);
  };

  return (
    <div className={styles.homeContainer}>
      <main className={styles.content}>
        {user ? (          <div className={styles.postOnlyContainer}>
            <h2 data-aos="fade-right">Bảng tin</h2>
            
            <div className={styles.feedContainer}>
              <CreatePost onPostCreated={handlePostCreated} />
              <PostList key={newPost?.id} username="" onlyFollowing={false} />
            </div>
          </div>
        ) : (          <>
            <div className={styles.heroSection}>
              <div className={styles.heroText}>
                <h1 data-aos="fade-down">Chào mừng đến với SocialApp</h1>
                <p data-aos="fade-up" data-aos-delay="100">Kết nối với bạn bè, chia sẻ khoảnh khắc và khám phá thế giới mới!</p>
                <div className={styles.actionButtons}>
                  <button onClick={openLoginModal} className={styles.loginButton} data-aos="fade-right" data-aos-delay="200">
                    Đăng nhập
                  </button>
                  <button onClick={openRegisterModal} className={styles.registerButton} data-aos="fade-left" data-aos-delay="300">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>            {/* Features Section */}
            <div className={styles.ctaSection}>
              <h2 data-aos="fade-up">Tính năng nổi bật</h2>
              <p data-aos="fade-up">Khám phá những tính năng tuyệt vời mà SocialApp mang lại cho bạn</p>
              <div className={styles.featureGrid}>
                <div className={styles.featureCard} data-aos="fade-up" data-aos-delay="100">
                  <span className={styles.icon}>
                    <FaUsers />
                  </span>
                  <h3>Kết nối bạn bè</h3>
                  <p>Dễ dàng kết nối với bạn bè và những người có cùng sở thích từ khắp nơi trên thế giới.</p>
                </div>
                <div className={styles.featureCard} data-aos="fade-up" data-aos-delay="200">
                  <span className={styles.icon}>
                    <FaComments />
                  </span>
                  <h3>Trò chuyện trực tiếp</h3>
                  <p>Giao tiếp ngay lập tức với bạn bè của bạn thông qua các tin nhắn và cuộc trò chuyện nhóm.</p>
                </div>
                <div className={styles.featureCard} data-aos="fade-up" data-aos-delay="300">
                  <span className={styles.icon}>
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
