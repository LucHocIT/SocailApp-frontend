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
import { SignalRProvider } from './context/SignalRContext';

// Import components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/Navbar';
import ChatWidget from './components/Chat/ChatWidget';
import ConnectionStatus from './components/Chat/ConnectionStatus';

// Import pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RequestVerificationPage from './pages/RequestVerificationPage';
import PostPage from './pages/PostPage';
import Messages from './pages/Messages/Messages';

function App() {
  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: false
    });
  }, []);
  return (
    <Router>
      <AppProvider>
        <SignalRProvider>
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
            theme="light"
          />
          <Navbar />
          <div className="app-content"><Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/request-verification" element={<RequestVerificationPage />} />            <Route path="/post/:postId" element={<PostPage />} />
            {/* Public profile route - anyone can view profiles */}
            <Route path="/profile/:userId" element={<ProfilePage />} />            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/messages" element={<Messages />} />
            </Route>          </Routes>
        </div>
        <ConnectionStatus />
        <ChatWidget />
        <footer className="app-footer">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <p>&copy; 2025 SocialApp. All rights reserved.</p>
              </div>
              <div className="col-md-6 text-end">
                <p>Made with ❤️ for social connections</p>
              </div>            </div>
          </div>
        </footer>
        </SignalRProvider>
      </AppProvider>
    </Router>
  );
}

export default App
