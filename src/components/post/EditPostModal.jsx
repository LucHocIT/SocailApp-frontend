import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Image } from 'react-bootstrap';
import { FaImage, FaTimes } from 'react-icons/fa';
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
      toast.error('Kích thước tập tin không được vượt quá 10MB');
      return;
    }

    // Create a preview
    const preview = URL.createObjectURL(file);
    setMediaPreview(preview);
    setMediaFile(file);
    setRemoveExistingMedia(true);
  };

  const removeMedia = () => {
    if (mediaPreview) {
      setMediaFile(null);
      setMediaPreview('');
    }
    
    if (existingMediaUrl) {
      setRemoveExistingMedia(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !mediaFile && !existingMediaUrl) {
      toast.error('Vui lòng nhập nội dung hoặc thêm hình ảnh cho bài viết');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Handle media file
      let mediaUrl = existingMediaUrl;
      if (mediaFile) {
        const uploadResult = await postService.uploadMedia(mediaFile);
        if (uploadResult && uploadResult.mediaUrl) {
          mediaUrl = uploadResult.mediaUrl;
        }
      } else if (removeExistingMedia) {
        mediaUrl = null;
      }

      // Update the post
      const postData = {
        content: content.trim(),
        mediaUrl
      };
      
      const updatedPost = await postService.updatePost(post.id, postData);
      
      if (onSave) {
        onSave(updatedPost);
      }
      
      toast.success('Bài viết đã được cập nhật thành công!');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Không thể cập nhật bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isMediaImage = (url) => {
    return url && url.match(/\.(jpeg|jpg|gif|png)$/i);
  };
  
  const isMediaVideo = (url) => {
    return url && url.match(/\.(mp4|webm|ogg)$/i);
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
              placeholder="Nội dung bài viết..."
              value={content}
              onChange={handleContentChange}
              className={styles.postInput}
              rows={5}
              disabled={isSubmitting}
            />
          </Form.Group>

          {/* Existing media preview */}
          {existingMediaUrl && !removeExistingMedia && (
            <div className={styles.mediaPreviewContainer}>
              {isMediaImage(existingMediaUrl) ? (
                <Image src={existingMediaUrl} alt="Current media" className={styles.mediaPreview} />
              ) : isMediaVideo(existingMediaUrl) ? (
                <video className={styles.mediaPreview} controls>
                  <source src={existingMediaUrl} type={`video/${existingMediaUrl.split('.').pop()}`} />
                  Your browser does not support the video tag.
                </video>
              ) : null}
              <Button variant="danger" size="sm" className={styles.removeMediaButton} onClick={removeMedia}>
                <FaTimes />
              </Button>
            </div>
          )}

          {/* New media preview */}
          {mediaPreview && (
            <div className={styles.mediaPreviewContainer}>
              {mediaFile.type.startsWith('image/') ? (
                <Image src={mediaPreview} alt="Preview" className={styles.mediaPreview} />
              ) : mediaFile.type.startsWith('video/') ? (
                <video className={styles.mediaPreview} controls>
                  <source src={mediaPreview} type={mediaFile.type} />
                  Your browser does not support the video tag.
                </video>
              ) : null}
              <Button variant="danger" size="sm" className={styles.removeMediaButton} onClick={removeMedia}>
                <FaTimes />
              </Button>
            </div>
          )}

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
