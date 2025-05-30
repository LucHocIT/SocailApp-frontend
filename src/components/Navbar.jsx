import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/hooks';
import { FaChevronDown, FaSignOutAlt, FaUser, FaCog, FaBell, FaHome, FaUsers, FaComments } from 'react-icons/fa';
import AuthModals from './auth/AuthModals';
import UserSearch from './user/UserSearch';
import styles from './Navbar.module.scss';


const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const notificationsRef = useRef(null);

  // Handle navbar scroll effect with enhanced animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // Close mobile menu and user dropdown when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };  

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) {
      setHasUnreadNotifications(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Chỉ đóng thông báo khi click bên ngoài, không áp dụng cho dropdown menu người dùng
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock notifications data - in a real app, this would come from an API
  const notifications = [
    { id: 1, text: 'Nguyễn Văn A đã thích bài viết của bạn', time: '30 phút trước', read: false },
    { id: 2, text: 'Trần Thị B đã bình luận về ảnh của bạn', time: '2 giờ trước', read: true },
    { id: 3, text: 'Lê Hoàng C bắt đầu theo dõi bạn', time: '1 ngày trước', read: true },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>        <div className={styles.logo}>
          <Link to="/" className={`fade-in ${location.pathname === '/' ? styles.active : ''}`}>
            <img src="/logo.svg" alt="SocialApp" />
            SocialApp
          </Link>
        </div>          {user && (
          <div className={styles.navIcons}>
            <Link to="/friends" className={`${styles.navIcon} ${location.pathname === '/friends' ? styles.active : ''}`}>
              <FaUsers />
              <span className={styles.iconLabel}>Bạn bè</span>
            </Link>
            <Link to="/chat" className={`${styles.navIcon} ${location.pathname === '/chat' ? styles.active : ''}`}>
              <FaComments />
              <span className={styles.iconLabel}>Chat</span>
            </Link>
          </div>
        )}
        
        {/* Add User Search component */}
      <div className={styles.searchArea}>
          <UserSearch />
        </div>
        
        <button 
          className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
        </button>
        
        <div className={`${styles.links} ${mobileMenuOpen ? styles.active : ''}`}>
          {user ? (
            <>
              {/* Notifications Icon */}
              <div className={styles.notificationsContainer} ref={notificationsRef}>
                <button 
                  className={`${styles.notificationButton} ${notificationsOpen ? styles.active : ''}`}
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                >
                  <FaBell />
                  {hasUnreadNotifications && <span className={styles.notificationBadge}></span>}
                </button>
                
                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className={styles.notificationsDropdown}>
                    <div className={styles.notificationsHeader}>
                      <h3>Thông báo</h3>
                      <button className={styles.markAllRead}>Đánh dấu đã đọc</button>
                    </div>
                    <div className={styles.notificationsList}>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                        >
                          <div className={styles.notificationAvatar}>
                            <div className={styles.avatarPlaceholder}></div>
                          </div>
                          <div className={styles.notificationContent}>
                            <p>{notification.text}</p>
                            <span className={styles.notificationTime}>{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.notificationsFooter}>
                      <Link to="/notifications">Xem tất cả thông báo</Link>
                    </div>
                  </div>
                )}
              </div>
                {/* User dropdown menu */}
              <div 
                className={styles.userMenu} 
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button 
                  className={styles.profileButton}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  {user.profilePictureUrl ? (
                    <img 
                      src={user.profilePictureUrl}
                      alt={`${user.firstName}'s profile`}
                      className={styles.profilePic}
                    />
                  ) : (
                    <div className={styles.profilePic}>
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                  )}
                  <span className={styles.userName}>
                    {user.firstName} {user.lastName}
                  </span>
                  <FaChevronDown className={`${styles.dropdownIcon} ${dropdownOpen ? styles.open : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <Link to="/profile" className={styles.dropdownItem}>
                      <FaUser /> Hồ sơ
                    </Link>
                    <Link to="/settings" className={styles.dropdownItem}>
                      <FaCog /> Cài đặt
                    </Link>
                    <button onClick={logout} className={styles.dropdownItem}>
                      <FaSignOutAlt /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.auth}>
              <button onClick={openLoginModal} className="btn btn-outline shadow-hover">Đăng nhập</button>
              <button onClick={openRegisterModal} className="btn btn-primary shadow-hover">Đăng ký</button>
            </div>
          )}
        </div>
      </div>
      <AuthModals 
        isOpen={authModalOpen} 
        onClose={closeAuthModal} 
        initialMode={authModalMode} 
      />
    </nav>
  );
};

export default Navbar;
