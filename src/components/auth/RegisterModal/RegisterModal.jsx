// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../context';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaUserPlus,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaShieldAlt,
  FaUserCircle,
  FaIdCard,
  FaTimes
} from 'react-icons/fa';
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

const pageTransitionVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: { duration: 0.2 }
  }
};

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
};

const stepIndicatorVariants = {
  inactive: { scale: 1, backgroundColor: "var(--bg-light)" },
  active: {
    scale: [1, 1.2, 1],
    backgroundColor: "var(--primary-color)",
    transition: { duration: 0.5 }
  },
  completed: {
    scale: 1,
    backgroundColor: "var(--success-color)",
    transition: { duration: 0.3 }
  }
};

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const { registerWithVerification, requestVerificationCode, verifyCode } = useAuth();
  const [registerError, setRegisterError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [stepDirection, setStepDirection] = useState('next');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [fieldFocus, setFieldFocus] = useState({
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

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
      });
      // Request verification code
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
  };
  // Step 2: Verify code and complete registration
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
      };
      // Complete registration with verification
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

  return (
    <>
      <motion.div className="modal-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FaUserPlus style={{ marginRight: '8px' }} />
          Đăng ký tài khoản
        </motion.h2>
        <motion.button
          className={styles.closeButton}
          onClick={onClose}
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaTimes />
        </motion.button>
      </motion.div>

      <div className="modal-body">
        {registerError && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaShieldAlt style={{ marginRight: '8px', color: 'var(--danger-color)' }} />
            <strong>Lỗi đăng ký:</strong> {registerError}
          </motion.div>
        )}

        <motion.div className={styles.stepIndicator}>
          <motion.div
            className={`${styles.step} ${currentStep >= 1 ? styles.active : ''} ${currentStep > 1 ? styles.completed : ''}`}
            variants={stepIndicatorVariants}
            animate={currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "inactive"}
            data-title="Thông tin"
          >
            {currentStep > 1 ? <FaCheckCircle /> : <FaUserCircle />}
          </motion.div>
          <motion.div
            className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}
            variants={stepIndicatorVariants}
            animate={currentStep === 2 ? "active" : "inactive"}
            data-title="Xác minh"
          >
            <FaShieldAlt />
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait" custom={stepDirection}>
          {currentStep === 1 && (
            <motion.div
              className={styles.registerForm}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
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
                    <motion.div
                      className={styles.formRow}
                      variants={fieldVariants}
                    >
                      <div className={styles.formGroup}>
                        <label htmlFor="firstName">
                          <FaIdCard className={styles.inputIcon} /> Họ
                        </label>
                        <Field
                          type="text"
                          name="firstName"
                          placeholder="Nhập họ của bạn"
                          onFocus={() => setFieldFocus(prev => ({ ...prev, firstName: true }))}
                          onBlur={() => setFieldFocus(prev => ({ ...prev, firstName: false }))}
                        />
                        <ErrorMessage name="firstName" component="div" className={styles.errorText} />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="lastName">
                          <FaIdCard className={styles.inputIcon} /> Tên
                        </label>
                        <Field
                          type="text"
                          name="lastName"
                          placeholder="Nhập tên của bạn"
                          onFocus={() => setFieldFocus(prev => ({ ...prev, lastName: true }))}
                          onBlur={() => setFieldFocus(prev => ({ ...prev, lastName: false }))}
                        />
                        <ErrorMessage name="lastName" component="div" className={styles.errorText} />
                      </div>
                    </motion.div>

                    <motion.div
                      className={styles.formGroup}
                      variants={fieldVariants}
                    >
                      <label htmlFor="username">
                        <FaUser className={styles.inputIcon} /> Tên đăng nhập
                      </label>
                      <div className={styles.inputWithIcon}>
                        <Field
                          type="text"
                          name="username"
                          placeholder="Chọn tên đăng nhập của bạn"
                          onFocus={() => setFieldFocus(prev => ({ ...prev, username: true }))}
                          onBlur={() => setFieldFocus(prev => ({ ...prev, username: false }))}
                        />
                        <motion.div
                          animate={{
                            scale: fieldFocus.username ? 1.1 : 1,
                            color: fieldFocus.username ? 'var(--primary-color)' : 'var(--text-muted)'
                          }}
                        >
                          <FaUser className={styles.fieldIcon} />
                        </motion.div>
                      </div>
                      <ErrorMessage name="username" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.div
                      className={styles.formGroup}
                      variants={fieldVariants}
                    >
                      <label htmlFor="email">
                        <FaEnvelope className={styles.inputIcon} /> Email
                      </label>
                      <div className={styles.inputWithIcon}>
                        <Field
                          type="email"
                          name="email"
                          placeholder="Nhập địa chỉ email của bạn"
                          onFocus={() => setFieldFocus(prev => ({ ...prev, email: true }))}
                          onBlur={() => setFieldFocus(prev => ({ ...prev, email: false }))}
                        />
                        <motion.div
                          animate={{
                            scale: fieldFocus.email ? 1.1 : 1,
                            color: fieldFocus.email ? 'var(--primary-color)' : 'var(--text-muted)'
                          }}
                        >
                          <FaEnvelope className={styles.fieldIcon} />
                        </motion.div>
                      </div>
                      <ErrorMessage name="email" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.div
                      className={styles.formGroup}
                      variants={fieldVariants}
                    >
                      <label htmlFor="password">
                        <FaLock className={styles.inputIcon} /> Mật khẩu
                      </label>
                      <div className={styles.passwordField}>
                        <Field
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Nhập mật khẩu của bạn"
                          onFocus={() => setFieldFocus(prev => ({ ...prev, password: true }))}
                          onBlur={() => setFieldFocus(prev => ({ ...prev, password: false }))}
                        />
                        <motion.button
                          type="button"
                          className={styles.toggleVisibility}
                          onClick={() => setShowPassword(!showPassword)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </motion.button>
                      </div>
                      <ErrorMessage name="password" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.div
                      className={styles.formGroup}
                      variants={fieldVariants}
                    >
                      <label htmlFor="confirmPassword">
                        <FaLock className={styles.inputIcon} /> Xác nhận mật khẩu
                      </label>
                      <div className={styles.passwordField}>
                        <Field
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Nhập lại mật khẩu của bạn"
                          onFocus={() => setFieldFocus(prev => ({ ...prev, confirmPassword: true }))}
                          onBlur={() => setFieldFocus(prev => ({ ...prev, confirmPassword: false }))}
                        />
                        <motion.button
                          type="button"
                          className={styles.toggleVisibility}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </motion.button>
                      </div>
                      <ErrorMessage name="confirmPassword" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.div
                      className={styles.formActions}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <motion.button
                        type="submit"
                        className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''} ${styles.submitButton}`}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(var(--primary-color-rgb), 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSubmitting ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FaSpinner className={styles.loadingSpinner} />
                            <span style={{ marginLeft: '8px' }}>Đang đăng ký...</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FaUserPlus style={{ marginRight: '8px' }} /> Đăng ký
                          </motion.span>
                        )}
                      </motion.button>
                    </motion.div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}        {currentStep === 2 && (
            <motion.div
              className={styles.verificationStep}
              initial="enter"
              animate="center"
              exit="exit"
              variants={pageTransitionVariants}
              custom={stepDirection}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                className={styles.verificationHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  type="button"
                  className={styles.backButton}
                  onClick={handleGoBack}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaArrowLeft style={{ marginRight: '8px' }} /> Quay lại
                </motion.button>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {isCodeSent
                    ? <><FaEnvelope style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Nhập mã xác nhận đã được gửi đến email của bạn</>
                    : <><FaSpinner className={styles.loadingSpinner} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Đang chờ gửi mã xác nhận...</>
                  }
                </motion.p>
              </motion.div>

              <Formik
                initialValues={{ verificationCode: '' }}
                validationSchema={VerifyEmailSchema}
                onSubmit={handleVerifyCode}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <motion.div
                      className={styles.formGroup}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="verificationCode">
                        <FaShieldAlt className={styles.inputIcon} /> Mã xác nhận
                      </label>
                      <Field
                        type="text"
                        name="verificationCode"
                        className={styles.verificationInput}
                        maxLength={6}
                        placeholder="000000"
                        disabled={!isCodeSent}
                      />
                      <ErrorMessage name="verificationCode" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.div
                      className={styles.resendCode}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        type="button"
                        onClick={handleResendCode}
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary-color-rgb), 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEnvelope style={{ marginRight: '8px' }} />
                        {isCodeSent ? 'Gửi lại mã xác nhận' : 'Gửi mã xác nhận'}
                      </motion.button>
                    </motion.div>

                    <motion.button
                      type="submit"
                      className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                      disabled={isSubmitting || !isCodeSent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(var(--primary-color-rgb), 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaSpinner className={styles.loadingSpinner} />
                          <span style={{ marginLeft: '8px' }}>Đang xác nhận...</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaCheckCircle style={{ marginRight: '8px' }} /> Xác nhận
                        </motion.span>
                      )}
                    </motion.button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="modal-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Đã có tài khoản?{' '}
            <motion.a
              onClick={onSwitchToLogin}
              whileHover={{ scale: 1.05, color: 'var(--primary-color)' }}
            >
              Đăng nhập
            </motion.a>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterModal;
