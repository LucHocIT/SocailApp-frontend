import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/auth-modal.css';
import '../../styles/auth-components.css';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
});

const LoginModal = ({ onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const { login, socialLogin } = useAuth();
  const [loginError, setLoginError] = useState('');
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
      <div className="auth-modal-content">
        <div className="modal-header">
          <h2>Đăng nhập</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>          {loginError && (
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
            <Form>
              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập</label>
                <Field type="text" name="username" className="form-control" />
                <ErrorMessage name="username" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <Field type="password" name="password" className="form-control" />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="social-login">
          <p>Hoặc đăng nhập với:</p>
          <div className="social-buttons">
            <button onClick={handleGoogleLogin} className="btn btn-google">
              Google
            </button>
            <button onClick={handleFacebookLogin} className="btn btn-facebook">
              Facebook
            </button>
          </div>
        </div>
        
        <div className="auth-links">
          <p>
            Chưa có tài khoản?{' '}
            <button className="link-btn" onClick={onSwitchToRegister}>Đăng ký</button>
          </p>          <p>
            <button className="link-btn" onClick={onSwitchToForgotPassword}>
              Quên mật khẩu?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
