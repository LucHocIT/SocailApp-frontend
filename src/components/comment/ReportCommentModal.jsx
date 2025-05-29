import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaFlag, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import commentService from '../../services/commentService';
import styles from './styles/ReportCommentModal.module.scss';

const ReportCommentModal = ({ show, onHide, commentId, commentContent, commentAuthor }) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedReasons = [
    'Nội dung spam hoặc quảng cáo',
    'Ngôn từ không phù hợp hoặc thô tục',
    'Quấy rối hoặc bắt nạt',
    'Thông tin sai lệch hoặc tin giả',
    'Nội dung có tính chất phân biệt đối xử',
    'Nội dung vi phạm bản quyền',
    'Khác (vui lòng ghi rõ lý do)'
  ];

  const handleReasonChange = (selectedReason) => {
    setSelectedReason(selectedReason);
    if (selectedReason !== 'Khác (vui lòng ghi rõ lý do)') {
      setReason(selectedReason);
    } else {
      setReason('');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Vui lòng chọn lý do báo cáo');
      return;
    }

    if (selectedReason === 'Khác (vui lòng ghi rõ lý do)' && !reason.trim()) {
      setError('Vui lòng nhập lý do báo cáo');
      return;
    }

    if (reason.length < 5) {
      setError('Lý do báo cáo phải có ít nhất 5 ký tự');
      return;
    }

    if (reason.length > 300) {
      setError('Lý do báo cáo không được quá 300 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await commentService.reportComment({
        commentId: commentId,
        reason: reason
      });

      toast.success('Đã gửi báo cáo thành công. Chúng tôi sẽ xem xét và xử lý sớm nhất có thể.');
      handleClose();
    } catch (error) {
      const errorMessage = error.message || 'Không thể gửi báo cáo';
      setError(errorMessage);
      
      if (errorMessage.includes('already reported')) {
        toast.error('Bạn đã báo cáo bình luận này trước đó');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className={styles.modalTitle}>
          <FaFlag className={styles.flagIcon} />
          Báo cáo bình luận
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className={styles.commentPreview}>
          <div className={styles.commentInfo}>
            <strong>Bình luận của {commentAuthor}:</strong>
          </div>
          <div className={styles.commentContent}>
            "{commentContent}"
          </div>
        </div>

        <Alert variant="info" className={styles.infoAlert}>
          <FaExclamationTriangle />
          <span>
            Báo cáo này sẽ được gửi đến đội ngũ quản trị để xem xét. 
            Vui lòng chọn lý do phù hợp và cung cấp thông tin chi tiết.
          </span>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Lý do báo cáo</Form.Label>
            {predefinedReasons.map((predefinedReason, index) => (
              <Form.Check
                key={index}
                type="radio"
                id={`reason-${index}`}
                label={predefinedReason}
                name="reportReason"
                value={predefinedReason}
                checked={selectedReason === predefinedReason}
                onChange={() => handleReasonChange(predefinedReason)}
                className={styles.reasonOption}
              />
            ))}
          </Form.Group>

          {selectedReason === 'Khác (vui lòng ghi rõ lý do)' && (
            <Form.Group className="mb-3">
              <Form.Label>Chi tiết lý do</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
                maxLength={300}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                {reason.length}/300 ký tự
              </Form.Text>
            </Form.Group>
          )}

          {error && (
            <Alert variant="danger" className={styles.errorAlert}>
              {error}
            </Alert>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button 
          variant="danger" 
          onClick={handleSubmit}
          disabled={loading || !selectedReason}
          className={styles.reportButton}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Đang gửi...
            </>
          ) : (
            <>
              <FaFlag className="me-2" />
              Gửi báo cáo
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportCommentModal;
