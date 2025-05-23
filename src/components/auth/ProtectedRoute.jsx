import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/hooks';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading indicator while checking auth status
  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }
    // Redirect to home page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
