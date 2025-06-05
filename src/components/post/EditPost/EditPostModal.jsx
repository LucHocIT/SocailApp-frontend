import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner, Container, Row, Col } from 'react-bootstrap';
import { FaSave, FaEdit, FaTimes, FaImage, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import postService from '../../../services/postService';
import EditMediaUploader from './EditMediaUploader';
import EditPostControls from './EditPostControls';
import styles from '../styles/EditPostModal.module.scss';

const EditPostModal = ({ show, post, onHide, onSave }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMediaFiles, setExistingMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState(0); // 0 = Public, 1 = Private, 2 = Secret
  const textareaRef = useRef(null);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setLocation(post.location || '');
      // Map privacy level: backend provides privacyLevel (0=Public, 1=Private, 2=Secret)
      // If privacyLevel exists, use it; otherwise fallback to isPrivate for backward compatibility
      if (typeof post.privacyLevel !== 'undefined') {
        setPrivacyLevel(post.privacyLevel);
      } else if (typeof post.PrivacyLevel !== 'undefined') {
        setPrivacyLevel(post.PrivacyLevel);
      } else {
        // Fallback to isPrivate for backward compatibility
        setPrivacyLevel(post.isPrivate ? 1 : 0);
      }
      setMediaFiles([]);
      
      // Set existing media files - handle multiple media files
      const mediaFiles = post.MediaFiles || post.mediaFiles || [];
      
      if (mediaFiles.length > 0) {
        // Handle multiple media files
        const existingMedia = mediaFiles.map((media, index) => ({
          mediaUrl: media.mediaUrl || media.MediaUrl,
          mediaType: media.mediaType || media.MediaType,
          mediaPublicId: media.mediaPublicId || media.MediaPublicId,
          mediaMimeType: media.mediaMimeType || media.MediaMimeType,
          mediaFilename: media.mediaFilename || media.MediaFilename,
          isExisting: true,
          orderIndex: index
        }));
        setExistingMediaFiles(existingMedia);
      } else if (post.mediaUrl) {
        // Legacy support for single media
        setExistingMediaFiles([{
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          mediaPublicId: post.mediaPublicId,
          mediaMimeType: post.mediaMimeType,
          mediaFilename: post.mediaFilename,
          isExisting: true,
          orderIndex: 0
        }]);
      } else {
        setExistingMediaFiles([]);
      }
    }
  }, [post]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!content.trim() && mediaFiles.length === 0 && existingMediaFiles.length === 0) {
      toast.error('Bài viết phải có nội dung hoặc media');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let uploadedMediaFiles = [];
      
      // Upload new media files if any
      if (mediaFiles.length > 0) {
        const mediaFilesToUpload = mediaFiles.map(m => m.file);
        const mediaTypes = mediaFiles.map(m => m.mediaType);
        
        try {
          const uploadResult = await postService.uploadMultipleMedia(mediaFilesToUpload, mediaTypes);
          
          if (uploadResult && uploadResult.success) {
            uploadedMediaFiles = uploadResult.results.map((result, index) => ({
              mediaUrl: result.mediaUrl,
              mediaType: result.mediaType || mediaTypes[index],
              mediaPublicId: result.publicId,
              mediaMimeType: result.mediaType,
              mediaFilename: result.mediaFilename,
              orderIndex: existingMediaFiles.length + index
            }));
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Lỗi khi tải lên media. Vui lòng thử lại.');
          return;
        }
      }

      // Combine existing and newly uploaded media
      const allMediaFiles = [
        ...existingMediaFiles.map((media, index) => ({
          ...media,
          orderIndex: index
        })),
        ...uploadedMediaFiles
      ];

      const postData = {
        content: content.trim(),
        location: location || null,
        privacyLevel: privacyLevel,
        mediaFiles: allMediaFiles
      };

      const updatedPost = await postService.updatePost(post.id, postData);
      
      toast.success('Bài viết đã được cập nhật thành công!');
      onSave(updatedPost);
      
      // Clean up media preview URLs
      mediaFiles.forEach(media => {
        if (media.previewUrl) {
          URL.revokeObjectURL(media.previewUrl);
        }
      });
      
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      toast.error(error.message || 'Lỗi khi cập nhật bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="xl" 
      className={styles.editModal}
      backdrop="static"
      keyboard={!isSubmitting}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <div className={styles.titleContent}>
            <FaEdit className={styles.titleIcon} />
            <span>Chỉnh sửa bài viết</span>
          </div>
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={onHide} 
          className={styles.closeButton}
          disabled={isSubmitting}
        >
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <Container fluid className={styles.editContainer}>
          <Row className={styles.editRow}>
            {/* Editor Section */}
            <Col lg={8} className={styles.editorSection}>
              <div className={styles.editorWrapper}>
                <div className={styles.textareaContainer}>
                  <Form.Control
                    ref={textareaRef}
                    as="textarea"
                    value={content}
                    onChange={handleContentChange}
                    className={styles.contentTextarea}
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                    rows={6}
                    disabled={isSubmitting}
                  />
                  
                  {/* Character count */}
                  <div className={styles.characterCount}>
                    <span className={content.length > 2000 ? styles.overLimit : ''}>
                      {content.length}/2000
                    </span>
                  </div>
                </div>
                
                {/* Post Controls */}
                <EditPostControls
                  content={content}
                  setContent={setContent}
                  location={location}
                  setLocation={setLocation}
                  privacyLevel={privacyLevel}
                  setPrivacyLevel={setPrivacyLevel}
                  isSubmitting={isSubmitting}
                  textareaRef={textareaRef}
                />
              </div>
            </Col>

            {/* Media Preview Section */}
            <Col lg={4} className={styles.mediaSection}>
              <div className={styles.mediaSectionHeader}>
                <div className={styles.sectionTitle}>
                  <FaImage className={styles.sectionIcon} />
                  <span>Media</span>
                  <span className={styles.mediaCount}>
                    ({existingMediaFiles.length + mediaFiles.length}/10)
                  </span>
                </div>
              </div>
              
              <div className={styles.mediaPreviewArea}>
                <EditMediaUploader
                  mediaFiles={mediaFiles}
                  setMediaFiles={setMediaFiles}
                  existingMediaFiles={existingMediaFiles}
                  setExistingMediaFiles={setExistingMediaFiles}
                  isSubmitting={isSubmitting}
                />
              </div>
            </Col>
          </Row>
          
          {/* Post Statistics */}
          <Row className={styles.statsRow}>
            <Col>
              <div className={styles.postStats}>
                <div className={styles.statItem}>
                  <FaFileAlt className={styles.statIcon} />
                  <span>Nội dung: {content.trim().split(' ').filter(word => word).length} từ</span>
                </div>
                <div className={styles.statItem}>
                  <FaImage className={styles.statIcon} />
                  <span>Media: {existingMediaFiles.length + mediaFiles.length} file</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <div className={styles.footerContent}>
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            <FaTimes className={styles.buttonIcon} />
            Hủy bỏ
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSubmit}
            className={styles.saveButton}
            disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0 && existingMediaFiles.length === 0)}
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
                <FaSave className={styles.buttonIcon} />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal;
