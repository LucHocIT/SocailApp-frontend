import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/hooks';
import { FaChevronDown, FaUser, FaBell, FaHome, FaUsers, FaComments } from 'react-icons/fa';
import AuthModals from './auth/AuthModals';
import UserSearch from './user/UserSearch';
import NotificationDropdown from './notification/NotificationDropdown';
import styles from './Navbar.module.scss';


const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);  const [authModalMode, setAuthModalMode] = useState('login');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>        <div className={styles.logo}>
          <Link to="/" className={`fade-in ${location.pathname === '/' ? styles.active : ''}`}>
            <img src="/logo.svg" alt="SocialApp" />
            SocialApp
          </Link>
        </div>          {user && (          <div className={styles.navIcons}>
            <Link to="/friends" className={`${styles.navIcon} ${location.pathname === '/friends' ? styles.active : ''}`}>
              <FaUsers />
              <span className={styles.iconLabel}>Bạn bè</span>
            </Link>
            <Link to="/chat" className={`${styles.navIcon} ${location.pathname === '/chat' ? styles.active : ''}`}>
              <FaComments />
              <span className={styles.iconLabel}>Tin nhắn</span>
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
              {/* Notifications */}
              <NotificationDropdown />
              
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
                </button>                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <Link to="/profile" className={styles.dropdownItem}>
                      <FaUser /> Hồ sơ
                    </Link>
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
