import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaTimes, FaFile, FaVideo, FaSave, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import styles from './styles/EditPostModal.module.scss';

const EditPostModal = ({ show, post, onHide, onSave }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [existingMediaUrl, setExistingMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const mediaInputRef = useRef(null);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setExistingMediaUrl(post.mediaUrl || '');
      setMediaFile(null);
      setMediaPreview('');
      setRemoveExistingMedia(false);
    }
  }, [post]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // New method to trigger file upload with specific types
  const triggerMediaUpload = (acceptTypes) => {
    if (mediaInputRef.current) {
      mediaInputRef.current.accept = acceptTypes;
      mediaInputRef.current.click();
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Kích thước tối đa là 10MB');
      return;
    }

    setMediaFile(file);
    setRemoveExistingMedia(true);

    // Create preview URL
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview('');
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setRemoveExistingMedia(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile && !existingMediaUrl) {
      toast.error('Vui lòng thêm nội dung hoặc phương tiện cho bài viết của bạn');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      
      formData.append('removeExistingMedia', removeExistingMedia);

      const updatedPost = await postService.updatePost(post.id, formData);
      onSave(updatedPost);
      toast.success('Bài viết đã được cập nhật thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      toast.error(error.message || 'Lỗi khi cập nhật bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <Modal show={show} onHide={onHide} centered size="lg" className={styles.editModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEdit className={styles.titleIcon} /> Chỉnh sửa bài viết
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.content}>
        <Form onSubmit={handleSubmit} className={styles.editorContainer}>
          <div className={styles.textareaWrapper}>
            <Form.Control
              as="textarea"
              value={content}
              onChange={handleContentChange}
              className={styles.textarea}
              placeholder="Bạn đang nghĩ gì?"
              rows={4}
            />
          </div>          {(mediaFile || existingMediaUrl) && (
            <div className={styles.mediaPreviewContainer}>
              {mediaFile ? (
                <>
                  {mediaFile.type.startsWith('image/') ? (
                    <Image src={mediaPreview} alt="Preview" 
                      className={styles.mediaItem}
                    />
                  ) : mediaFile.type.startsWith('video/') ? (
                    <video 
                      className={styles.videoItem}
                      controls
                    >
                      <source src={mediaPreview} type={mediaFile.type} />
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  ) : (
                    <div className={styles.filePreview}>
                      <div>
                        <FaFile className={styles.fileIcon} />
                        <p className={styles.fileName}>{mediaFile.name}</p>
                        <small className={styles.fileSize}>({Math.round(mediaFile.size / 1024)} KB)</small>
                      </div>
                    </div>
                  )}
                </>
              ) : existingMediaUrl && !removeExistingMedia ? (
                <>
                  {post.mediaType === 'image' ? (
                    <Image 
                      src={existingMediaUrl} 
                      alt="Current media" 
                      className={styles.mediaItem} 
                    />
                  ) : post.mediaType === 'video' ? (
                    <video 
                      className={styles.videoItem}
                      controls
                    >
                      <source src={existingMediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  ) : (
                    <div className={styles.filePreview}>
                      <a 
                        href={existingMediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.fileLink}
                      >
                        <FaFile /> {post.mediaFilename || 'Tải xuống tập tin'}
                      </a>
                    </div>
                  )}
                </>
              ) : null}
              {(mediaFile || (existingMediaUrl && !removeExistingMedia)) && (
                <Button
                  variant="light"
                  className={styles.removeButton}
                  onClick={handleRemoveMedia}
                >
                  <FaTimes />
                </Button>
              )}
            </div>
          )}          <div className={styles.mediaToolbar}>
            <div className={styles.mediaButtons}>
              {/* Image upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên hình ảnh</Tooltip>}
              >
                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.imageButton}`}
                  onClick={() => triggerMediaUpload('image/*')}
                >
                  <FaImage className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>
              
              {/* Video upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên video</Tooltip>}
              >
                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.videoButton}`}
                  onClick={() => triggerMediaUpload('video/*')}
                >
                  <FaVideo className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>
              
              {/* File upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên tập tin</Tooltip>}
              >
                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.fileButton}`}
                  onClick={() => triggerMediaUpload('.pdf,.doc,.docx,.xls,.xlsx,.txt')}
                >
                  <FaFile className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>
              
              <Form.Control
                type="file"
                onChange={handleMediaChange}
                className={styles.hiddenInput}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                ref={mediaInputRef}
              />
            </div>
          </div>
        </Form>
      </Modal.Body>      <Modal.Footer className={styles.footer}>
        <Button
          variant="light"
          onClick={onHide}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className={styles.spinner}
                role="status"
                aria-hidden="true"
              />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <FaSave className={styles.icon} />
              <span>Lưu thay đổi</span>
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal;
