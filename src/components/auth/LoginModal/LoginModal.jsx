import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../context/hooks';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaTimes,
  FaSignInAlt,
  FaGoogle,
  FaFacebook,
  FaQuestionCircle,
  FaUserPlus,
  FaEnvelope,
  FaKey,
  FaSpinner,
  FaShieldAlt
} from 'react-icons/fa';
import styles from './LoginModal.module.scss';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
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

const LoginModal = ({ onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {  
  const { login, socialLogin } = useAuth();
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldFocus, setFieldFocus] = useState({ username: false, password: false });
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
    
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    if (isProcessing) return; // Prevent multiple submissions
    
    setLoginError(''); // Clear any previous errors
    setIsProcessing(true);
      try {
      const result = await login(values.username, values.password);
      if (result) {
        // Đăng nhập thành công vẫn được phép đóng modal
        onClose();
      }
    } catch (error) {
      // Xử lý lỗi và hiển thị thông báo, nhưng KHÔNG đóng modal
      console.error("Login error:", error);
      
      // Set error message to ensure modal stays open with error displayed
      setLoginError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
      setSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    if (isProcessing) return; // Prevent multiple submissions
    
    try {
      setLoginError(''); // Clear any previous errors
      setIsProcessing(true);
        const { signInWithGoogle } = await import("../../../services/social-auth");
        signInWithGoogle((provider, accessToken) => {
          handleSocialLoginCallback(provider, accessToken);
        });
    } catch (error) {
      console.error('Google login error:', error);
      setLoginError(`Không thể kết nối với Google: ${error.message || 'Vui lòng thử lại sau.'}`);
      // Không đặt toast vì chúng ta hiển thị lỗi trong modal
      setIsProcessing(false);    }
  };
    const handleFacebookLogin = async () => {
    if (isProcessing) return; // Prevent multiple submissions
    
    try {
      setLoginError(''); // Clear any previous errors
      setIsProcessing(true);
        // Import dynamically to avoid loading the SDK until needed
      const { signInWithFacebook } = await import("../../../services/social-auth");
      signInWithFacebook((provider, accessToken) => {
        handleSocialLoginCallback(provider, accessToken);
      });
    } catch (error) {
      console.error('Facebook login handler error:', error);
      if (error.message && (error.message.includes('Tracking Prevention') || error.message.includes('chặn'))) {
        setLoginError('Trình duyệt đang chặn Facebook. Vui lòng tắt chế độ chặn theo dõi trong cài đặt trình duyệt hoặc sử dụng phương thức đăng nhập khác.');
      } else {
        setLoginError('Không thể kết nối với Facebook. Vui lòng thử lại sau: ' + error.message);
      }
      // Không đặt toast vì chúng ta hiển thị lỗi trong modal
      setIsProcessing(false);
    }
  };
    const handleSocialLoginCallback = async (provider, accessToken) => {
    setLoginError(''); // Clear any previous errors
    setIsProcessing(true);
      try {
      if (!accessToken) {
        throw new Error('Không nhận được token xác thực từ ' + provider);
      }
        const result = await socialLogin(provider, accessToken);
      
      if (result) {
        onClose(); // Đăng nhập thành công vẫn được phép đóng modal
      }    } catch (error) {
      console.error(`${provider} login failed`);
      setLoginError(error.message || `Đăng nhập bằng ${provider} thất bại. Vui lòng thử lại.`);
      // Không gọi onClose() để giữ modal mở và hiển thị lỗi
    } finally {
      setIsProcessing(false);
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
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FaSignInAlt style={{ marginRight: '8px' }} /> Đăng nhập
        </motion.h2>        <motion.button 
          className={styles.closeButton} 
          onClick={onClose}
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaTimes />
        </motion.button>
      </motion.div>
      <div className="modal-body">
        {loginError && (
          <div className={styles.loginError}>
            <strong>Lỗi:</strong> {loginError}
          </div>
        )}
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="auth-form">
              <motion.div 
                className={styles.formGroup}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <label htmlFor="username">
                  <motion.span
                    variants={iconAnimationVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <FaUser className={styles.inputIcon} />
                  </motion.span>
                  {" "} Tên đăng nhập
                </label>
                <div className={styles.inputWithIcon}>
                  <Field 
                    type="text" 
                    name="username" 
                    placeholder="Nhập tên đăng nhập của bạn"
                    onFocus={() => setFieldFocus(prev => ({ ...prev, username: true }))}
                    onBlur={() => setFieldFocus(prev => ({ ...prev, password: false }))}
                  />
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ 
                      opacity: fieldFocus.username ? 1 : 0.5,
                      scale: fieldFocus.username ? 1.1 : 1
                    }}
                  >
                    <FaUser className={styles.fieldIcon} />
                  </motion.div>
                </div>
                <ErrorMessage name="username" component="div" className={styles.error} />
              </motion.div>

              <motion.div 
                className={styles.formGroup}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <label htmlFor="password">
                  <motion.span
                    variants={iconAnimationVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <FaLock className={styles.inputIcon} />
                  </motion.span>
                  {" "} Mật khẩu
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
                    onClick={togglePasswordVisibility}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </motion.div>
                  </motion.button>
                </div>
                <ErrorMessage name="password" component="div" className={styles.error} />
              </motion.div>

              <motion.div 
                className={styles.actions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <motion.button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmitting || isProcessing ? 'btn-loading' : ''}`}
                  disabled={isSubmitting || isProcessing}                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ 
                    boxShadow: "0 0 15px rgba(var(--primary-color-rgb), 0.5)" 
                  }}
                >
                  {isSubmitting || isProcessing ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <FaSpinner className={styles.loadingSpinner} />
                      <span style={{ marginLeft: '8px' }}>Đang đăng nhập...</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <FaSignInAlt style={{ marginRight: '8px' }} /> Đăng nhập
                    </motion.span>
                  )}
                </motion.button>                <motion.span 
                  className={styles.forgotPassword} 
                  onClick={onSwitchToForgotPassword}
                  whileHover={{ scale: 1.03 }}
                  style={{ 
                    color: 'var(--primary-color)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <FaKey style={{ marginRight: '5px' }} /> Quên mật khẩu?
                </motion.span>
              </motion.div>
            </Form>
          )}
        </Formik>          <motion.div 
          className="modal-footer"
          style={{ padding: "var(--spacing-2) var(--spacing-6) var(--spacing-4)" }} // Reduced padding
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        ><motion.div 
            className="divider"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              Hoặc đăng nhập với
            </motion.span>
          </motion.div>
            <motion.div 
            className={styles.socialLoginButtons}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <motion.button 
              onClick={handleGoogleLogin} 
              disabled={isProcessing}
              title="Đăng nhập với Google"
              whileHover={{ scale: 1.1 }}
              style={{ boxShadow: "0 0 8px rgba(234, 67, 53, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className={styles.googleButton}
            >
              <FaGoogle size={20} />
            </motion.button>
            
            <motion.button 
              onClick={handleFacebookLogin} 
              disabled={isProcessing}
              title="Đăng nhập với Facebook"
              whileHover={{ scale: 1.1 }}
              style={{ boxShadow: "0 0 8px rgba(59, 89, 152, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className={styles.facebookButton}
            >
              <FaFacebook size={20} />
            </motion.button>
          </motion.div>
            <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            Chưa có tài khoản?{' '}
            <motion.a 
              onClick={onSwitchToRegister}              whileHover={{ scale: 1.05 }}
              className={styles.registerLink}
              style={{ color: 'var(--primary-color)' }}
            >
              <FaUserPlus style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Đăng ký
            </motion.a>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginModal;
