import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import AOS from 'aos';

// Bootstrap CSS & App styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

// Import context providers
import { AppProvider } from './context';
import { UserBlockProvider } from './context/UserBlockContext';
import NotificationProvider from './context/NotificationContext';

// Import components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/Navbar';
import ChatWidget from './components/chat/ChatWidget';

// Import pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RequestVerificationPage from './pages/RequestVerificationPage';
import PostPage from './pages/PostPage';
import Friends from './pages/Friends';
import Chat from './pages/Chat';


function App() {
  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: false
    });
  }, []);
  return (    <Router>
      <AppProvider>
        <UserBlockProvider>
          <NotificationProvider>
            <ToastContainer
              position="top-right" 
              autoClose={3000} 
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"            />
            <Navbar />
            <ChatWidget />
            <div className="app-content"><Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/request-verification" element={<RequestVerificationPage />} />            <Route path="/post/:postId" element={<PostPage />} />
            {/* Public profile route - anyone can view profiles */}
            <Route path="/profile/:userId" element={<ProfilePage />} />            {/* Protected routes - require authentication */}            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/chat" element={<Chat />} />
            </Route></Routes>        </div>        <footer className="app-footer">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <p>&copy; 2025 SocialApp. All rights reserved.</p>
              </div>
              <div className="col-md-6 text-end">
                <p>Made with ❤️ for social connections</p>
              </div>            </div>
          </div>        </footer>
          </NotificationProvider>
        </UserBlockProvider>
      </AppProvider>
    </Router>
  );
}

export default App
