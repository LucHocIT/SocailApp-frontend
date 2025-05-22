import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { FaHome, FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';
import AuthModals from './auth/AuthModals';
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
  };  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className="fade-in">
            <img src="/logo.svg" alt="SocialApp" />
            SocialApp
          </Link>
        </div>
        
        <button 
          className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
        </button>
        
        <div className={`${styles.links} ${mobileMenuOpen ? styles.active : ''}`}>
          <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>
            <FaHome className="me-1" /> Trang chủ
          </Link>
          
          {user ? (
            <>
              <Link to="/profile" className={`${styles.navLink} ${location.pathname.includes('/profile') ? styles.active : ''}`}>
                <FaUser className="me-1" /> Hồ sơ
              </Link>
              <div className={styles.auth}>
                <span className={styles.userGreeting}>
                  Xin chào, {user.firstName}
                </span>
                <button onClick={logout} className="btn btn-logout">
                  <FaSignOutAlt className="me-1" /> Đăng xuất
                </button>
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
