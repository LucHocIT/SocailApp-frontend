import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Image } from 'react-bootstrap';
import { FaImage, FaTimes, FaFile } from 'react-icons/fa';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import styles from './Post.module.scss';

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
    }  }, [post]);

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Kích thước tối đa là 10MB');
      return;
    }

    setMediaFile(file);
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);    setRemoveExistingMedia(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let mediaUrl = removeExistingMedia ? null : existingMediaUrl;
      let mediaType = null;
      let mediaPublicId = null;

      if (mediaFile) {
        // Determine media type for upload
        let uploadMediaType = "file";
        if (mediaFile.type.startsWith('image/')) {
          uploadMediaType = "image";
        } else if (mediaFile.type.startsWith('video/')) {
          uploadMediaType = "video";
        }
        
        const uploadResult = await postService.uploadMedia(mediaFile, uploadMediaType);
        if (uploadResult.success) {
          mediaUrl = uploadResult.mediaUrl;
          mediaType = uploadMediaType;  // Use the same mediaType we determined for upload
          mediaPublicId = uploadResult.publicId;
        }
      }

      const updatedPost = await postService.updatePost(post.id, {
        content,
        mediaUrl,
        mediaType,
        mediaPublicId
      });

      if (onSave) {
        onSave(updatedPost);
      }

      toast.success('Bài viết đã được cập nhật thành công!');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error(error.message || 'Không thể cập nhật bài viết. Vui lòng thử lại sau.');    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa bài viết</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </Form.Group>

          {/* Show existing media or preview */}
          {(existingMediaUrl && !removeExistingMedia) || mediaPreview ? (
            <div className={styles.mediaPreviewContainer}>
              {mediaPreview ? (
                <>
                  {mediaFile?.type.startsWith('image/') ? (
                    <Image src={mediaPreview} alt="Preview" className={styles.mediaPreview} />
                  ) : mediaFile?.type.startsWith('video/') ? (
                    <video className={styles.mediaPreview} controls>
                      <source src={mediaPreview} type={mediaFile.type} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className={styles.fileContainer}>
                      <span className={styles.filePreview}>
                        <FaFile /> {mediaFile.name}
                      </span>
                    </div>
                  )}
                </>
              ) : existingMediaUrl && !removeExistingMedia ? (
                <>
                  {post.mediaType === 'image' ? (
                    <Image src={existingMediaUrl} alt="Current media" className={styles.mediaPreview} />
                  ) : post.mediaType === 'video' ? (
                    <video className={styles.mediaPreview} controls>
                      <source src={existingMediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className={styles.fileContainer}>
                      <a 
                        href={existingMediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.fileDownload}
                      >
                        <FaFile /> Tập tin đính kèm
                      </a>
                    </div>
                  )}
                </>
              ) : null}
              <Button 
                variant="danger" 
                size="sm" 
                className={styles.removeMediaButton} 
                onClick={() => {
                  if (mediaPreview) {
                    setMediaFile(null);
                    setMediaPreview('');
                  } else {
                    setRemoveExistingMedia(true);
                  }
                }}
              >
                <FaTimes />
              </Button>
            </div>
          ) : null}

          <div className={styles.createPostFooter}>
            {(!existingMediaUrl || removeExistingMedia) && !mediaFile && (
              <div className={styles.mediaUpload}>
                <label htmlFor="edit-media-upload" className={styles.mediaUploadLabel}>
                  <FaImage /> Thêm hình ảnh/video
                </label>
                <Form.Control
                  id="edit-media-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className={styles.mediaUploadInput}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !mediaFile && !existingMediaUrl)}
        >
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Đang lưu...</span>
            </>
          ) : 'Lưu thay đổi'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal;
