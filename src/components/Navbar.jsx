import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { FaChevronDown, FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa';
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

  // Handle navbar scroll effect
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
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
  };  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>        <div className={styles.logo}>
          <Link to="/" className="fade-in">
            <img src="/logo.svg" alt="SocialApp" />
            SocialApp
          </Link>
        </div>
        
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
            <div className={styles.userMenu} ref={dropdownRef}>              <div 
                className={styles.profileButton}
                role="button"
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
              </div>
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
            </div>
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
