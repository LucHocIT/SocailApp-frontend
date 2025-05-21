import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { FaHome, FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';
import AuthModals from './auth/AuthModals';

// Import SCSS styles
import './Navbar.scss';

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
  };
  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="fade-in">
            <img src="/logo.svg" alt="SocialApp" />
            SocialApp
          </Link>
        </div>
        
        <button 
          className={`navbar-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger"></span>
        </button>
        
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <FaHome className="me-1" /> Trang chủ
          </Link>
          
          {user ? (
            <>
              <Link to="/profile" className={`nav-link ${location.pathname.includes('/profile') ? 'active' : ''}`}>
                <FaUser className="me-1" /> Hồ sơ
              </Link>
              <div className="navbar-auth">
                <span className="user-greeting">
                  Xin chào, {user.firstName}
                </span>
                <button onClick={logout} className="btn btn-logout">
                  <FaSignOutAlt className="me-1" /> Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
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
