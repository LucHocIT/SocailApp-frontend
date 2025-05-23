import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/hooks';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUnlock,
  FaTimes,
  FaArrowLeft,
  FaCheck,
  FaPaperPlane,
  FaShieldAlt,
  FaSpinner,
  FaKey
} from 'react-icons/fa';
import styles from './ForgotPasswordModal.module.scss';

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

const iconAnimationVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  hover: { 
    scale: 1.2,
    rotate: [0, -10, 10, -10, 0],
    transition: { duration: 0.3 }
  }
};

const stepVariants = {
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

const pageTransitionVariants = {
  enter: (direction) => ({
    x: direction === 'next' ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction === 'next' ? -1000 : 1000,
    opacity: 0
  })
};

const ForgotPasswordModal = ({ onClose, onSwitchToLogin }) => {
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  // Step 1: Request reset password code
  const handleRequestCode = async (values, { setSubmitting }) => {
    setError(''); // Clear any previous errors
    try {
      setEmail(values.email);
      const response = await requestPasswordReset(values.email);
        if (response.success) {
        toast.success('Mã xác nhận đã được gửi đến email của bạn');
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
  };  return (
    <>      <motion.div 
        className="modal-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FaUnlock style={{ marginRight: '8px' }} /> Quên mật khẩu
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
        {error && (
          <motion.div 
            className={styles.error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaShieldAlt style={{ marginRight: '8px' }} />
            <strong>Lỗi:</strong> {error}
          </motion.div>
        )}
        
        <motion.div 
          className={styles.stepIndicator}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className={`${styles.step} ${currentStep >= 1 ? styles.active : ''} ${currentStep > 1 ? styles.completed : ''}`}
            data-title="Yêu cầu"
            variants={stepVariants}
            animate={currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "inactive"}
          >
            {currentStep > 1 ? <FaCheck className={styles.checkIcon} /> : <FaKey />}
          </motion.div>
          
          <motion.div 
            className={`${styles.step} ${currentStep >= 2 ? styles.active : ''} ${currentStep > 2 ? styles.completed : ''}`}
            data-title="Xác minh"
            variants={stepVariants}
            animate={currentStep > 2 ? "completed" : currentStep === 2 ? "active" : "inactive"}
          >
            {currentStep > 2 ? <FaCheck className={styles.checkIcon} /> : <FaShieldAlt />}
          </motion.div>
          
          <motion.div 
            className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}
            data-title="Đặt lại"
            variants={stepVariants}
            animate={currentStep === 3 ? "active" : "inactive"}
          >
            <FaLock />
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div 
              className={styles.forgotPasswordStep}
              initial="enter"
              animate="center"
              exit="exit"
              variants={pageTransitionVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Vui lòng nhập email của bạn để nhận mã xác nhận.
              </motion.p>
              
              <Formik
                initialValues={{ email: '' }}
                validationSchema={RequestCodeSchema}
                onSubmit={handleRequestCode}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label>
                        <motion.span
                          variants={iconAnimationVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                        >
                          <FaEnvelope className={styles.inputIcon} />
                        </motion.span>
                        {" "} Email
                      </label>
                      <div className={styles.inputWithIcon}>
                        <Field 
                          type="email" 
                          name="email" 
                          placeholder="Nhập địa chỉ email của bạn"
                        />
                        <FaEnvelope className={styles.fieldIcon} />
                      </div>
                      <ErrorMessage name="email" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.button 
                      type="submit" 
                      className="btn btn-primary btn-block" 
                      disabled={isSubmitting}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaSpinner className={styles.loadingSpinner} />
                          <span style={{ marginLeft: '8px' }}>Đang gửi...</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaPaperPlane style={{ marginRight: '8px' }} /> Gửi mã xác nhận
                        </motion.span>
                      )}
                    </motion.button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              className={styles.forgotPasswordStep}
              initial="enter"
              animate="center"
              exit="exit"
              variants={pageTransitionVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Nhập mã xác nhận đã được gửi đến email của bạn.
              </motion.p>

              <Formik
                initialValues={{ email, code: '' }}
                validationSchema={VerifyCodeSchema}
                onSubmit={handleVerifyCode}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label>
                        <motion.span
                          variants={iconAnimationVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                        >
                          <FaShieldAlt className={styles.inputIcon} />
                        </motion.span>
                        {" "} Mã xác nhận
                      </label>
                      <Field 
                        type="text" 
                        name="code" 
                        className={styles.verificationInput}
                        maxLength={6}
                      />
                      <ErrorMessage name="code" component="div" className={styles.errorText} />
                    </motion.div>
                    
                    <motion.div 
                      className={styles.resendCode}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.button 
                        type="button"
                        onClick={handleResendCode}
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary-color-rgb), 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEnvelope style={{ marginRight: '8px' }} />
                        Gửi lại mã xác nhận
                      </motion.button>
                    </motion.div>

                    <motion.button 
                      type="submit" 
                      className="btn btn-primary btn-block" 
                      disabled={isSubmitting}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
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
                          <FaCheck style={{ marginRight: '8px' }} /> Xác nhận mã
                        </motion.span>
                      )}
                    </motion.button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              className={styles.forgotPasswordStep}
              initial="enter"
              animate="center"
              exit="exit"
              variants={pageTransitionVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Nhập mật khẩu mới của bạn.
              </motion.p>

              <Formik
                initialValues={{ email, code, newPassword: '', confirmPassword: '' }}
                validationSchema={ResetPasswordSchema}
                onSubmit={handleResetPassword}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label>
                        <motion.span
                          variants={iconAnimationVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                        >
                          <FaLock className={styles.inputIcon} />
                        </motion.span>
                        {" "} Mật khẩu mới
                      </label>
                      <div className={styles.passwordField}>
                        <Field 
                          type="password" 
                          name="newPassword"
                          placeholder="Nhập mật khẩu mới" 
                        />
                      </div>
                      <ErrorMessage name="newPassword" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label>
                        <motion.span
                          variants={iconAnimationVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                        >
                          <FaLock className={styles.inputIcon} />
                        </motion.span>
                        {" "} Xác nhận mật khẩu
                      </label>
                      <div className={styles.passwordField}>
                        <Field 
                          type="password" 
                          name="confirmPassword"
                          placeholder="Nhập lại mật khẩu mới" 
                        />
                      </div>
                      <ErrorMessage name="confirmPassword" component="div" className={styles.errorText} />
                    </motion.div>

                    <motion.button 
                      type="submit" 
                      className="btn btn-primary btn-block" 
                      disabled={isSubmitting}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaSpinner className={styles.loadingSpinner} />
                          <span style={{ marginLeft: '8px' }}>Đang đặt lại mật khẩu...</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaKey style={{ marginRight: '8px' }} /> Đặt lại mật khẩu
                        </motion.span>
                      )}
                    </motion.button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div className="modal-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.a 
              onClick={onSwitchToLogin}
              whileHover={{ scale: 1.05, color: 'var(--primary-color)' }}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <FaArrowLeft style={{ marginRight: '8px' }} /> Quay lại đăng nhập
            </motion.a>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordModal;
