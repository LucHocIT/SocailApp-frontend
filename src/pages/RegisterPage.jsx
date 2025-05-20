import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/auth.css';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(30, 'Tên đăng nhập không được vượt quá 30 ký tự')
    .required('Vui lòng nhập tên đăng nhập'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
  firstName: Yup.string()
    .required('Vui lòng nhập họ'),
  lastName: Yup.string()
    .required('Vui lòng nhập tên'),
  verificationCode: Yup.string()
    .required('Vui lòng nhập mã xác nhận'),
});

const RegisterPage = () => {
  const { registerWithVerification, requestVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await registerWithVerification({
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        verificationCode: values.verificationCode
      });
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      setRegisterError(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      toast.error('Đăng ký thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendVerificationCode = async (email) => {
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    try {
      await requestVerificationCode(email);
      setIsCodeSent(true);
      toast.success('Mã xác nhận đã được gửi đến email của bạn');
    } catch (error) {
      toast.error('Không thể gửi mã xác nhận. Vui lòng thử lại.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Đăng ký tài khoản</h1>
        
        {registerError && <div className="error-message">{registerError}</div>}
        
        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            verificationCode: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Họ</label>
                  <Field type="text" name="firstName" className="form-control" />
                  <ErrorMessage name="firstName" component="div" className="error-text" />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Tên</label>
                  <Field type="text" name="lastName" className="form-control" />
                  <ErrorMessage name="lastName" component="div" className="error-text" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập</label>
                <Field type="text" name="username" className="form-control" />
                <ErrorMessage name="username" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="form-email-group">
                  <Field type="email" name="email" className="form-control" />
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => handleSendVerificationCode(values.email)}
                    disabled={isCodeSent}
                  >
                    {isCodeSent ? 'Đã gửi mã' : 'Gửi mã'}
                  </button>
                </div>
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="verificationCode">Mã xác nhận</label>
                <Field type="text" name="verificationCode" className="form-control" />
                <ErrorMessage name="verificationCode" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <Field type="password" name="password" className="form-control" />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <Field type="password" name="confirmPassword" className="form-control" />
                <ErrorMessage name="confirmPassword" component="div" className="error-text" />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="auth-links">
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
