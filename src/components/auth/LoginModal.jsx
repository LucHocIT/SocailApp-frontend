import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
});

const LoginModal = ({ onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {  
  const { login, socialLogin } = useAuth();
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
    
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    if (isProcessing) return; // Prevent multiple submissions
    
    setLoginError(''); // Clear any previous errors
    setIsProcessing(true);
    
    try {
      const result = await login(values.username, values.password);
      if (result) {
        toast.success('Đăng nhập thành công!');
        // Đăng nhập thành công vẫn được phép đóng modal
        onClose();
      }
    } catch (error) {
      // Xử lý lỗi và hiển thị thông báo, nhưng KHÔNG đóng modal
      console.error("Login error:", error);
      
      // Set error message to ensure modal stays open with error displayed
      setLoginError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
      setSubmitting(false);    }
  };
  
  const handleGoogleLogin = async () => {
    if (isProcessing) return; // Prevent multiple submissions
    
    try {
      setLoginError(''); // Clear any previous errors
      setIsProcessing(true);
      
      // Import dynamically to avoid loading the SDK until needed
      const { signInWithGoogle } = await import('../../services/social-auth');
      signInWithGoogle((provider, accessToken) => {
        handleSocialLoginCallback(provider, accessToken);
      });
    } catch (error) {
      setLoginError('Không thể kết nối với Google. Vui lòng thử lại sau.');
      // Không đặt toast vì chúng ta hiển thị lỗi trong modal
      setIsProcessing(false);    }
  };
    const handleFacebookLogin = async () => {
    if (isProcessing) return; // Prevent multiple submissions
    
    try {
      setLoginError(''); // Clear any previous errors
      setIsProcessing(true);
        // Import dynamically to avoid loading the SDK until needed
      const { signInWithFacebook } = await import('../../services/social-auth');
      signInWithFacebook((provider, accessToken) => {
        handleSocialLoginCallback(provider, accessToken);
      });
    } catch (error) {
      console.error('Facebook login handler error:', error);
      if (error.message && (error.message.includes('Tracking Prevention') || error.message.includes('chặn'))) {
        setLoginError('Trình duyệt đang chặn Facebook. Vui lòng tắt chế độ chặn theo dõi trong cài đặt trình duyệt hoặc sử dụng phương thức đăng nhập khác.');
      } else {
        setLoginError('Không thể kết nối với Facebook. Vui lòng thử lại sau: ' + error.message);
      }
      // Không đặt toast vì chúng ta hiển thị lỗi trong modal
      setIsProcessing(false);
    }
  };
    const handleSocialLoginCallback = async (provider, accessToken) => {
    setLoginError(''); // Clear any previous errors
    setIsProcessing(true);
      try {
      if (!accessToken) {
        throw new Error('Không nhận được token xác thực từ ' + provider);
      }
      
      const result = await socialLogin(provider, accessToken);
      
      if (result) {
        toast.success('Đăng nhập thành công!');
        onClose(); // Đăng nhập thành công vẫn được phép đóng modal
      }    } catch (error) {
      console.error(`${provider} login failed`);
      setLoginError(error.message || `Đăng nhập bằng ${provider} thất bại. Vui lòng thử lại.`);
      // Không gọi onClose() để giữ modal mở và hiển thị lỗi
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="auth-modal">      <div className="auth-modal-content">        <div className="modal-header">
          <h2 className="gradient-text">Đăng nhập</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
          <div className="login-note small text-muted">(Vui lòng đăng nhập, đăng ký mới, hoặc quên mật khẩu)</div>
        </div>{loginError && (
          <div className="error-message">
            <strong>Lỗi:</strong> {loginError}
          </div>
        )}
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>              <div className="form-group input-focus-effect">
                <label htmlFor="username">Tên đăng nhập</label>
                <Field 
                  type="text" 
                  name="username" 
                  className="form-control" 
                  placeholder="Nhập tên đăng nhập của bạn"
                />
                <ErrorMessage name="username" component="div" className="error-text" />
              </div>

              <div className="form-group input-focus-effect">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-field">
                  <Field 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="form-control" 
                    placeholder="Nhập mật khẩu của bạn"
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>              <button 
                type="submit" 
                className={`btn btn-primary btn-block btn-shimmer ${isSubmitting || isProcessing ? 'btn-loading' : ''}`}
                disabled={isSubmitting || isProcessing}
              >
                <span>
                  {isSubmitting || isProcessing ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </span>
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="social-login">
          <p>Hoặc đăng nhập với:</p>          <div className="social-buttons">            <button 
              onClick={handleGoogleLogin} 
              className={`btn-3d social-btn social-btn-google btn-ripple ${isProcessing ? 'disabled' : ''}`}
              disabled={isProcessing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#EA4335">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{isProcessing ? 'Đang xử lý...' : 'Google'}</span>
            </button>
            <button 
              onClick={handleFacebookLogin} 
              className={`btn-3d social-btn social-btn-facebook btn-ripple ${isProcessing ? 'disabled' : ''}`}
              disabled={isProcessing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#3B5998">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
              <span>{isProcessing ? 'Đang xử lý...' : 'Facebook'}</span>
            </button>
          </div>
        </div>
        
        <div className="auth-links">          <p>
            Chưa có tài khoản?{' '}
            <button className="link-btn" onClick={onSwitchToRegister}>
              <span>Đăng ký</span>
            </button>
          </p>
          <p>
            <button className="link-btn" onClick={onSwitchToForgotPassword}>
              <span>Quên mật khẩu?</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
