import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Image } from 'react-bootstrap';
import { FaImage, FaTimes, FaFile } from 'react-icons/fa';
import { toast } from 'react-toastify';
import postService from '../../services/postService';

const EditPostModal = ({ show, post, onHide, onSave }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [existingMediaUrl, setExistingMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);

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
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Chỉnh sửa bài viết</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form onSubmit={handleSubmit} className="edit-form">
          <Form.Group>
            <Form.Control
              as="textarea"
              value={content}
              onChange={handleContentChange}
              className="textarea-field"
              placeholder="Bạn đang nghĩ gì?"
            />
          </Form.Group>

          {(mediaFile || existingMediaUrl) && (
            <div className="media-preview-container">
              {mediaFile ? (
                <>
                  {mediaFile.type.startsWith('image/') ? (
                    <Image src={mediaPreview} alt="Preview" className="media-preview" />
                  ) : mediaFile.type.startsWith('video/') ? (
                    <video className="media-preview" controls>
                      <source src={mediaPreview} type={mediaFile.type} />
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  ) : (
                    <div className="file-container">
                      <span className="file-preview">
                        <FaFile /> {mediaFile.name}
                      </span>
                    </div>
                  )}
                </>
              ) : existingMediaUrl && !removeExistingMedia ? (
                <>
                  {post.mediaType === 'image' ? (
                    <Image src={existingMediaUrl} alt="Current media" className="media-preview" />
                  ) : post.mediaType === 'video' ? (
                    <video className="media-preview" controls>
                      <source src={existingMediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  ) : (
                    <div className="file-container">
                      <a 
                        href={existingMediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="file-download"
                      >
                        <FaFile /> {post.mediaFilename || 'Tải tập tin'}
                      </a>
                    </div>
                  )}
                </>
              ) : null}
              {(mediaFile || (existingMediaUrl && !removeExistingMedia)) && (
                <Button
                  variant="link"
                  className="btn-close position-absolute top-0 end-0 m-2 bg-white"
                  onClick={handleRemoveMedia}
                  title="Xóa phương tiện"
                />
              )}
            </div>
          )}

          <div className="d-flex align-items-center justify-content-between mt-3">
            <div>
              <Form.Label htmlFor="edit-media-upload" className="btn btn-outline-primary mb-0">
                <FaImage className="me-2" />
                Thêm phương tiện
              </Form.Label>
              <Form.Control
                type="file"
                id="edit-media-upload"
                onChange={handleMediaChange}
                className="d-none"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button
          variant="light"
          onClick={onHide}
          className="cancel-button"
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className="save-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Đang lưu...
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal;
