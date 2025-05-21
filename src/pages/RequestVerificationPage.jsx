import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context';
import { toast } from 'react-toastify';
import { FaEnvelope, FaCheck, FaExclamationTriangle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import styles
import './RequestVerificationPage.scss';

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email')
});

const RequestVerificationPage = () => {  const { requestVerificationCode } = useAuth();
  const [requestError, setRequestError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true
    });
  }, []);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await requestVerificationCode(values.email);
      if (response?.success) {
        setSuccess(true);
        toast.success('Mã xác nhận đã được gửi đến email của bạn');
      } else {
        setRequestError(response?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại sau.');
        toast.error('Không thể gửi mã xác nhận.');
      }
    } catch (error) {
      setRequestError(error.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
      toast.error('Không thể gửi mã xác nhận.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="verification-container">
      <div className="verification-card" data-aos="fade-up">
        <div className="card-header">
          <div className="header-blob blob-1"></div>
          <div className="header-blob blob-2"></div>
          <div className="verification-icon" data-aos="zoom-in" data-aos-delay="200">
            <FaEnvelope />
          </div>
          <h1>Xác thực email</h1>
          <p>Vui lòng nhập địa chỉ email của bạn để nhận mã xác nhận</p>
        </div>
        
        <div className="card-body">
          {requestError && (
            <div className="error-message" data-aos="fade-in">
              <FaExclamationTriangle /> {requestError}
            </div>
          )}
          
          {success ? (
            <div className="success-message" data-aos="fade-in">
              <div className="success-icon">
                <FaCheck />
              </div>
              <h3>Đã gửi mã xác nhận!</h3>
              <p>Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (và thư mục spam) và sử dụng mã xác nhận để hoàn tất đăng ký.</p>
              <Link to="/" className="home-link">
                <FaArrowLeft /> Quay về trang chủ
              </Link>
            </div>
          ) : (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={EmailSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="verification-form">
                  <div className="form-group" data-aos="fade-up" data-aos-delay="100">
                    <label htmlFor="email">Địa chỉ email</label>
                    <div className="input-group has-icon">
                      <FaEnvelope className="input-icon" />
                      <Field 
                        type="email" 
                        name="email" 
                        className="form-control" 
                        placeholder="Nhập email của bạn" 
                      />
                    </div>
                    <ErrorMessage 
                      name="email" 
                      component="div" 
                      className="error" 
                    />
                  </div>                  <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={isSubmitting}
                    data-aos="fade-up" 
                    data-aos-delay="200"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="fa-spin" /> Đang gửi...
                      </>
                    ) : 'Gửi mã xác nhận'}
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
        
        <div className="card-footer">
          <p>
            <Link to="/">Quay về trang chủ</Link>
          </p>
        </div>
      </div>
      
      <div className="steps">
        <h3 data-aos="fade-up">Quy trình xác thực</h3>
        
        <div className="steps-container">
          <div className="step" data-aos="fade-up" data-aos-delay="100">
            <div className="step-number">1</div>
            <h4>Nhập email</h4>
            <p>Nhập địa chỉ email mà bạn muốn xác thực</p>
          </div>
          
          <div className="step" data-aos="fade-up" data-aos-delay="200">
            <div className="step-number">2</div>
            <h4>Nhận mã</h4>
            <p>Kiểm tra hộp thư của bạn để nhận mã xác nhận</p>
          </div>
          
          <div className="step" data-aos="fade-up" data-aos-delay="300">
            <div className="step-number">3</div>
            <h4>Hoàn tất</h4>
            <p>Sử dụng mã xác thực để hoàn tất quá trình xác thực</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestVerificationPage;
