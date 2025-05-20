import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
// Step 1: Request code
const RequestCodeSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email')
});

// Step 2: Verify code
const VerifyCodeSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  code: Yup.string()
    .required('Vui lòng nhập mã xác nhận')
    .length(6, 'Mã xác nhận phải có đúng 6 ký tự')
});

// Step 3: Reset password
const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  code: Yup.string()
    .required('Vui lòng nhập mã xác nhận')
    .length(6, 'Mã xác nhận phải có đúng 6 ký tự'),
  newPassword: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu mới'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu')
});

const ForgotPasswordModal = ({ onClose, onSwitchToLogin }) => {
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  
  // Step 1: Request reset password code
  const handleRequestCode = async (values, { setSubmitting }) => {
    setError(''); // Clear any previous errors
    try {
      setEmail(values.email);
      const response = await requestPasswordReset(values.email);
      
      if (response.success) {
        toast.success('Mã xác nhận đã được gửi đến email của bạn');
        setIsCodeSent(true);
        setCurrentStep(2);
      } else {
        setError(response.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
      }
    } catch (error) {
      setError(error.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
      // Don't use toast here since we're showing the error in the modal
      // toast.error('Không thể gửi mã xác nhận.');
    } finally {
      setSubmitting(false);
    }  };
  
  // Step 2: Verify reset code
  const handleVerifyCode = async (values, { setSubmitting }) => {
    setError(''); // Clear any previous errors
    try {
      setCode(values.code);
      const response = await verifyResetCode(values.email, values.code);
      
      if (response.success) {
        toast.success('Mã xác nhận hợp lệ');
        setCurrentStep(3);
      } else {
        setError(response.message || 'Mã xác nhận không hợp lệ. Vui lòng thử lại.');
      }
    } catch (error) {
      setError(error.message || 'Mã xác nhận không hợp lệ. Vui lòng thử lại.');
      // Don't use toast here since we're showing the error in the modal
      // toast.error('Mã xác nhận không hợp lệ.');
    } finally {
      setSubmitting(false);
    }  };
  
  // Step 3: Reset password
  const handleResetPassword = async (values, { setSubmitting }) => {
    setError(''); // Clear any previous errors
    try {
      const resetData = {
        email: values.email,
        code: values.code,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      };
      
      const response = await resetPassword(resetData);
      
      if (response.success) {
        toast.success('Đặt lại mật khẩu thành công');
        onSwitchToLogin(); // Only switch to login on success
      } else {
        setError(response.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } catch (error) {
      setError(error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      // Don't use toast here since we're showing the error in the modal
      // toast.error('Không thể đặt lại mật khẩu.');
    } finally {
      setSubmitting(false);
    }  };
  
  // Handle resending verification code
  const handleResendCode = async () => {
    try {
      setError('');
      const response = await requestPasswordReset(email);
      
      if (response.success) {
        toast.success('Mã xác nhận mới đã được gửi đến email của bạn');
      } else {
        setError(response.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
      }
    } catch (error) {      setError(error.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
      // Don't use toast for error as we show it in the modal
      // toast.error('Không thể gửi mã xác nhận.');
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <div className="modal-header">
          <h2>Quên mật khẩu</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && (
          <div className="error-message">
            <strong>Lỗi:</strong> {error}
          </div>
        )}
        
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>1</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>2</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>
        
        {currentStep === 1 && (
          <div className="forgot-password-step">
            <p>Vui lòng nhập email của bạn để nhận mã xác nhận.</p>
            <Formik
              initialValues={{ email: '' }}
              validationSchema={RequestCodeSchema}
              onSubmit={handleRequestCode}
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
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="forgot-password-step">
            <p>Nhập mã xác nhận đã được gửi đến email của bạn.</p>
            <Formik
              initialValues={{ email, code: '' }}
              validationSchema={VerifyCodeSchema}
              onSubmit={handleVerifyCode}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <Field type="email" name="email" className="form-control" disabled />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="code">Mã xác nhận</label>
                    <Field type="text" name="code" className="form-control" />
                    <ErrorMessage name="code" component="div" className="error-text" />
                  </div>
                  
                  <div className="resend-code">
                    <button 
                      type="button" 
                      className="link-btn" 
                      onClick={handleResendCode}
                    >
                      Gửi lại mã xác nhận
                    </button>
                  </div>
  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận mã'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="forgot-password-step">
            <p>Nhập mật khẩu mới của bạn.</p>
            <Formik
              initialValues={{ email, code, newPassword: '', confirmPassword: '' }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleResetPassword}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <Field type="password" name="newPassword" className="form-control" />
                    <ErrorMessage name="newPassword" component="div" className="error-text" />
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
                    {isSubmitting ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}
        
        <div className="auth-links">
          <p>
            <button className="link-btn" onClick={onSwitchToLogin}>
              Quay lại đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
