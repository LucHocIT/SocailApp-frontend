import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

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
              <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
