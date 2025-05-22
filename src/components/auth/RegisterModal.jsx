import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context';
import { toast } from 'react-toastify';
import styles from './RegisterModal.module.scss';

// Registration step 1: Validate and submit user information
const RegisterInfoSchema = Yup.object().shape({
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
});

// Registration step 2: Verify email with code
const VerifyEmailSchema = Yup.object().shape({
  verificationCode: Yup.string()
    .required('Vui lòng nhập mã xác nhận')
    .length(6, 'Mã xác nhận phải có đúng 6 ký tự')
});

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const { registerWithVerification, requestVerificationCode, verifyCode } = useAuth();
  const [registerError, setRegisterError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [stepDirection, setStepDirection] = useState('next'); // 'next' or 'prev' for animations
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  // Step 1: Submit user registration info and request verification code
  const handleSubmitInfo = async (values, { setSubmitting }) => {
    setRegisterError(''); // Clear any previous errors
    try {
      // Store the user data for the next step
      setUserData({
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      });      // Request verification code
      const response = await requestVerificationCode(values.email);
      if (response?.success) {
        // Advance to verification step
        setIsCodeSent(true);
        setStepDirection('next');
        setCurrentStep(2);
        toast.success('Mã xác nhận đã được gửi đến email của bạn');
      } else {
        setRegisterError(response?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại sau.');
      }
    } catch (error) {
      // Set error but don't close the modal
      setRegisterError(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };  // Step 2: Verify code and complete registration
  const handleVerifyCode = async (values, { setSubmitting }) => {
    setRegisterError(''); // Clear any previous errors
    try {
      // First, verify the code with the server
      const result = await verifyCode(userData.email, values.verificationCode);
      
      if (!result.success) {
        setRegisterError(result.message || 'Mã xác nhận không chính xác hoặc đã hết hạn');
        setSubmitting(false);
        return;
      }
      
      // If code is valid, combine user data with verification code
      const completeUserData = {
        Username: userData.username,
        Email: userData.email,
        Password: userData.password,
        ConfirmPassword: userData.password,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        VerificationCode: values.verificationCode
      };      // Complete registration with verification
      await registerWithVerification(completeUserData);
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      
      // Switch to login modal instead of closing
      onSwitchToLogin();
    } catch (error) {
      // Set error but don't close the modal
      setRegisterError(error.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };
  // Handle resending verification code
  const handleResendCode = async () => {
    try {
      setRegisterError('');      const response = await requestVerificationCode(userData.email);
      
      if (response?.success) {
        setIsCodeSent(true);
        toast.success('Mã xác nhận mới đã được gửi đến email của bạn');
      } else {
        setRegisterError(response?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại sau.');
      }
    } catch (error) {
      setRegisterError(error.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại sau.');
    }  };
    // Handle going back to previous step
  const handleGoBack = () => {
    setStepDirection('prev');
    setCurrentStep(1);
    setIsCodeSent(false);
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <div className="modal-header">
        <h2>Đăng ký tài khoản</h2>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
      </div>
      
      <div className="modal-body">
        {registerError && (
          <div className={styles.errorMessage}>
            <strong>Lỗi đăng ký:</strong> {registerError}
          </div>
        )}
        
        <div className={styles.stepIndicator}>
          <div 
            className={`${styles.step} ${currentStep >= 1 ? styles.active : ''} ${currentStep > 1 ? styles.completed : ''}`}
            data-title="Thông tin"
          >
            1
          </div>
          <div 
            className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}
            data-title="Xác minh"
          >
            2
          </div>
        </div>

        {currentStep === 1 && (
          <div className={styles.registerForm}>
            <Formik
              initialValues={{
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
              }}
              validationSchema={RegisterInfoSchema}
              onSubmit={handleSubmitInfo}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName">Họ</label>
                      <Field 
                        type="text" 
                        name="firstName" 
                        placeholder="Nhập họ của bạn"
                      />
                      <ErrorMessage name="firstName" component="div" className={styles.errorText} />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="lastName">Tên</label>
                      <Field 
                        type="text" 
                        name="lastName" 
                        placeholder="Nhập tên của bạn"
                      />
                      <ErrorMessage name="lastName" component="div" className={styles.errorText} />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="username">Tên đăng nhập</label>
                    <Field 
                      type="text" 
                      name="username" 
                      placeholder="Chọn tên đăng nhập của bạn"
                    />
                    <ErrorMessage name="username" component="div" className={styles.errorText} />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <Field 
                      type="email" 
                      name="email" 
                      placeholder="Nhập địa chỉ email của bạn"
                    />
                    <ErrorMessage name="email" component="div" className={styles.errorText} />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="password">Mật khẩu</label>
                    <div className={styles.passwordField}>
                      <Field 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                      />
                      <button 
                        type="button" 
                        className={styles.toggleVisibility} 
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className={styles.errorText} />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                    <div className={styles.passwordField}>
                      <Field 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword" 
                      />
                      <button 
                        type="button" 
                        className={styles.toggleVisibility} 
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className={styles.errorText} />
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''} ${styles.submitButton}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}        {currentStep === 2 && (
          <div className={`${styles.verificationStep} ${stepDirection === 'next' ? styles.slideInRight : styles.slideInLeft}`}>
            <div className={styles.verificationHeader}>
              <button
                type="button"
                className={styles.backButton}
                onClick={handleGoBack}
              >
                <span>&larr;</span> Quay lại
              </button>
              <p>
                {isCodeSent 
                  ? "Nhập mã xác nhận đã được gửi đến email của bạn." 
                  : "Đang chờ gửi mã xác nhận..."}              </p>
            </div>
            <Formik
              initialValues={{ verificationCode: '' }}
              validationSchema={VerifyEmailSchema}
              onSubmit={handleVerifyCode}
            >
              {({ isSubmitting }) => (
                <Form>                  <div className={styles.formGroup}>
                    <label htmlFor="verificationCode">Mã xác nhận</label>
                    <Field 
                      type="text" 
                      name="verificationCode"
                      className={styles.verificationInput}
                      maxLength={6}
                      placeholder="000000"
                      disabled={!isCodeSent}
                    />
                    <ErrorMessage name="verificationCode" component="div" className={styles.errorText} />
                  </div>

                  <div className={styles.resendCode}>
                    <button 
                      type="button"
                      onClick={handleResendCode}
                    >
                      {isCodeSent ? 'Gửi lại mã xác nhận' : 'Gửi mã xác nhận'}
                    </button>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                    disabled={isSubmitting || !isCodeSent}
                  >
                    {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}
        
        <div className="modal-footer">
          <p>
            Đã có tài khoản?{' '}
            <a onClick={onSwitchToLogin}>Đăng nhập</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;
