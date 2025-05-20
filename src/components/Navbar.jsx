import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModals from './auth/AuthModals';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">SocialApp</Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Trang chủ</Link>
          
          {user ? (
            <>
              <Link to="/profile" className="nav-link">Hồ sơ</Link>
              <div className="navbar-auth">
                <span className="user-greeting">
                  Xin chào, {user.firstName}
                </span>
                <button onClick={logout} className="btn btn-logout">
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <button onClick={openLoginModal} className="btn btn-outline">Đăng nhập</button>
              <button onClick={openRegisterModal} className="btn btn-primary">Đăng ký</button>
            </div>          )}
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
