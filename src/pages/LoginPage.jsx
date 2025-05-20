import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/auth.css';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
});

const LoginPage = () => {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values.username, values.password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      setLoginError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      toast.error('Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // This would typically integrate with Google OAuth
    // For now, just show a placeholder message
    toast.info('Chức năng đăng nhập bằng Google đang được phát triển');
    
    // When integrating with real Google OAuth:
    // 1. Call the Google OAuth popup
    // 2. Get the access token
    // 3. Call socialLogin('google', accessToken)
  };

  const handleFacebookLogin = async () => {
    // Similar to Google login, this would integrate with Facebook OAuth
    toast.info('Chức năng đăng nhập bằng Facebook đang được phát triển');
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Đăng nhập</h1>
        
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
            <Link to="/register">Đăng ký</Link>
          </p>
          <p>
            <Link to="/request-verification">Quên mật khẩu?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
