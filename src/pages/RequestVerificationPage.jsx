import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/auth.css';

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email')
});

const RequestVerificationPage = () => {
  const { requestVerificationCode } = useAuth();
  const [requestError, setRequestError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await requestVerificationCode(values.email);
      setSuccess(true);
      toast.success('Mã xác nhận đã được gửi đến email của bạn');
    } catch (error) {
      setRequestError(error.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
      toast.error('Không thể gửi mã xác nhận.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Xác thực email</h1>
        
        {requestError && <div className="error-message">{requestError}</div>}
        
        {success ? (
          <div className="success-message">
            <p>Mã xác nhận đã được gửi đến email của bạn.</p>
            <p>Vui lòng kiểm tra email và sử dụng mã xác nhận để hoàn tất đăng ký.</p>
            <div className="auth-links">
              <Link to="/register" className="btn btn-primary">Đi đến trang đăng ký</Link>
            </div>
          </div>
        ) : (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={EmailSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field type="email" name="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="error-text" />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-block" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                </button>
              </Form>
            )}
          </Formik>
        )}
        
        <div className="auth-links">
          <p>
            <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestVerificationPage;
