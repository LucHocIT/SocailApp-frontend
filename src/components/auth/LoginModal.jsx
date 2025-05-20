import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/auth-modal.css';
import '../../styles/auth-components.css';
import '../../styles/auth-animations.css';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
});

const LoginModal = ({ onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {  const { login, socialLogin } = useAuth();
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoginError(''); // Clear any previous errors
    try {
      const result = await login(values.username, values.password);
      if (result) {
        toast.success('Đăng nhập thành công!');
        // Chỉ đóng modal khi đăng nhập thành công
        onClose();
      }
    } catch (error) {
      // Xử lý lỗi và hiển thị thông báo, nhưng KHÔNG đóng modal
      console.error("Login error:", error);
      setLoginError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      // Không đặt toast ở đây vì chúng ta đang hiển thị lỗi trong modal
      // toast.error('Đăng nhập thất bại.');
      
      // Không gọi onClose() để giữ modal mở
    } finally {
      setSubmitting(false);
    }
  };  const handleGoogleLogin = async () => {
    try {
      setLoginError(''); // Clear any previous errors
      // Import dynamically to avoid loading the SDK until needed
      const { signInWithGoogle } = await import('../../services/social-auth');
      signInWithGoogle((provider, accessToken) => {
        handleSocialLoginCallback(provider, accessToken);
      });
    } catch (error) {
      setLoginError('Không thể kết nối với Google. Vui lòng thử lại sau.');
      // Không đặt toast vì chúng ta hiển thị lỗi trong modal
      // toast.error('Không thể kết nối với Google.');
    }
  };
  const handleFacebookLogin = async () => {
    try {
      setLoginError(''); // Clear any previous errors
      // Import dynamically to avoid loading the SDK until needed
      const { signInWithFacebook } = await import('../../services/social-auth');
      signInWithFacebook((provider, accessToken) => {
        handleSocialLoginCallback(provider, accessToken);
      });
    } catch (error) {
      setLoginError('Không thể kết nối với Facebook. Vui lòng thử lại sau.');
      // Không đặt toast vì chúng ta hiển thị lỗi trong modal
      // toast.error('Không thể kết nối với Facebook.');
    }
  };
  const handleSocialLoginCallback = async (provider, accessToken) => {
    setLoginError(''); // Clear any previous errors
    try {
      const result = await socialLogin(provider, accessToken);
      if (result) {
        toast.success('Đăng nhập thành công!');
        onClose(); // Only close modal on successful login
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setLoginError(error.message || `Đăng nhập bằng ${provider} thất bại. Vui lòng thử lại.`);
      // Không đặt toast ở đây vì chúng ta đang hiển thị lỗi trong modal
      // toast.error(`Đăng nhập bằng ${provider} thất bại.`);
      
      // Không gọi onClose() để giữ modal mở
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">        <div className="modal-header">
          <h2 className="gradient-text">Đăng nhập</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
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
                className={`btn btn-primary btn-block btn-shimmer ${isSubmitting ? 'btn-loading' : ''}`}
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </span>
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="social-login">
          <p>Hoặc đăng nhập với:</p>
          <div className="social-buttons">            <button onClick={handleGoogleLogin} className="btn-3d social-btn social-btn-google btn-ripple">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#EA4335">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button onClick={handleFacebookLogin} className="btn-3d social-btn social-btn-facebook btn-ripple">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#3B5998">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
              <span>Facebook</span>
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
