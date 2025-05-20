import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import context providers
import { AuthProvider } from './context/AuthContext';

// Import components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/Navbar';

// Import pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RequestVerificationPage from './pages/RequestVerificationPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/request-verification" element={<RequestVerificationPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App
