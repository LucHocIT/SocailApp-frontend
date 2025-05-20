import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/auth-modal.css';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
});

const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const { login, socialLogin } = useAuth();
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values.username, values.password);
      toast.success('Đăng nhập thành công!');
      onClose();
    } catch (error) {
      setLoginError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      toast.error('Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    toast.info('Chức năng đăng nhập bằng Google đang được phát triển');
  };

  const handleFacebookLogin = async () => {
    toast.info('Chức năng đăng nhập bằng Facebook đang được phát triển');
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <div className="modal-header">
          <h2>Đăng nhập</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {loginError && <div className="error-message">{loginError}</div>}
        
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
          </p>
          <p>
            <button className="link-btn" onClick={() => toast.info("Chức năng quên mật khẩu đang được phát triển")}>
              Quên mật khẩu?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
