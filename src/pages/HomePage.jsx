import { useAuth } from '../context';
import { useEffect, useState } from 'react';
import { FaUsers, FaComments, FaHeart, FaShare, FaBell, FaGlobe, FaRegLightbulb } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CreatePost from '../components/post/CreatePost';
import PostList from '../components/post/PostList';
import styles from './HomePage.module.scss';

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
    <div className={styles.homeContainer}>
      <main className={styles.content}>
        {user ? (
          <div className={styles.postOnlyContainer}>
            <h2 className={styles.feedHeading} data-aos="fade-right">Bảng tin của bạn</h2>
            <div className={styles.feedContainer}>
              <CreatePost onPostCreated={handlePostCreated} />
              <PostList key={newPost?.id} username="" onlyFollowing={false} />
            </div>
          </div>
        ) : (
          <>
            <div className={styles.heroSection}>
              <div className={styles.heroText} data-aos="fade-up" data-aos-duration="1000">
                <h1 data-aos="fade-down">Chào mừng đến với SocialApp</h1>
                <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="100">Kết nối với bạn bè, chia sẻ khoảnh khắc và khám phá thế giới mới!</p>
                <div className={styles.actionButtons} data-aos="fade-up" data-aos-delay="200">
                  <button onClick={openLoginModal} className={`${styles.loginButton} shadow-hover`} data-aos="fade-right" data-aos-delay="200">
                    Đăng nhập
                  </button>
                  <button onClick={openRegisterModal} className={`${styles.registerButton} shadow-hover`} data-aos="fade-left" data-aos-delay="300">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
              <div className={styles.heroImage} data-aos="fade-left" data-aos-duration="1200">
                <img src="/images/hero-illustration.svg" alt="Social connection illustration" />
              </div>
            </div>
            
            {/* Features Section */}
            <div className={styles.ctaSection}>
              <h2 className="text-gradient-primary" data-aos="fade-up">Tính năng nổi bật</h2>
              <p className={styles.sectionSubtitle} data-aos="fade-up">Khám phá những tính năng tuyệt vời mà SocialApp mang lại cho bạn</p>
              <div className={styles.featureGrid}>
                <div className={`${styles.featureCard} shadow-hover`} data-aos="fade-up" data-aos-delay="100">
                  <span className={`${styles.icon} ${styles.iconPrimary}`}>
                    <FaUsers />
                  </span>
                  <h3>Kết nối bạn bè</h3>
                  <p>Dễ dàng kết nối với bạn bè và những người có cùng sở thích từ khắp nơi trên thế giới.</p>
                </div>
                <div className={`${styles.featureCard} shadow-hover`} data-aos="fade-up" data-aos-delay="200">
                  <span className={`${styles.icon} ${styles.iconSuccess}`}>
                    <FaComments />
                  </span>
                  <h3>Trò chuyện trực tiếp</h3>
                  <p>Giao tiếp ngay lập tức với bạn bè của bạn thông qua các tin nhắn và cuộc trò chuyện nhóm.</p>
                </div>
                <div className={`${styles.featureCard} shadow-hover`} data-aos="fade-up" data-aos-delay="300">
                  <span className={`${styles.icon} ${styles.iconWarning}`}>
                    <FaHeart />
                  </span>
                  <h3>Chia sẻ khoảnh khắc</h3>
                  <p>Chia sẻ những khoảnh khắc đặc biệt của bạn với hình ảnh, video và bài đăng hấp dẫn.</p>
                </div>
                <div className={`${styles.featureCard} shadow-hover`} data-aos="fade-up" data-aos-delay="400">
                  <span className={`${styles.icon} ${styles.iconInfo}`}>
                    <FaBell />
                  </span>
                  <h3>Thông báo thời gian thực</h3>
                  <p>Nhận thông báo tức thì khi có hoạt động mới liên quan đến bạn hoặc bài đăng của bạn.</p>
                </div>
              </div>
            </div>
            
            <div className={styles.divider} data-aos="fade-up"></div>
            
            <div className={styles.testimonialsSection}>
              <h2 className="text-gradient-primary" data-aos="fade-up">Người dùng nói gì về chúng tôi</h2>
              <div className={styles.testimonialCards}>
                <div className={`${styles.testimonialCard} shadow-hover-lg`} data-aos="fade-up" data-aos-delay="100">
                  <div className={styles.quote}>"SocialApp đã giúp tôi kết nối lại với những người bạn cũ. Giao diện dễ sử dụng và các tính năng tuyệt vời!"</div>
                  <div className={styles.author}>- Nguyễn Văn A</div>
                </div>
                <div className={`${styles.testimonialCard} shadow-hover-lg`} data-aos="fade-up" data-aos-delay="200">
                  <div className={styles.quote}>"Đây là mạng xã hội tốt nhất tôi từng dùng. Tôi thích cách nó tôn trọng quyền riêng tư của người dùng."</div>
                  <div className={styles.author}>- Trần Thị B</div>
                </div>
                <div className={`${styles.testimonialCard} shadow-hover-lg`} data-aos="fade-up" data-aos-delay="300">
                  <div className={styles.quote}>"Tôi đã tìm thấy nhiều cơ hội kinh doanh thông qua SocialApp. Thực sự là một nền tảng chuyên nghiệp!"</div>
                  <div className={styles.author}>- Lê Văn C</div>
                </div>
              </div>
            </div>
            
            <div className={styles.ctaBanner} data-aos="fade-up">
              <div className={styles.ctaContent}>
                <h2>Bắt đầu kết nối ngay hôm nay</h2>
                <p>Tham gia cùng hàng nghìn người dùng và tạo nên mạng lưới xã hội của riêng bạn</p>
                <button onClick={openRegisterModal} className={styles.ctaButton}>
                  Đăng ký miễn phí
                </button>
              </div>
              <div className={styles.ctaDecoration}>
                <FaRegLightbulb className={styles.decorationIcon} />
                <FaGlobe className={styles.decorationIcon} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
