import React, { useState, useRef } from 'react';
import { Card, Form, Button, Image, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaTimes, FaVideo, FaFile, FaPaperPlane, FaPaypal } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/hooks';
import postService from '../../services/postService';
import styles from './styles/CreatePost.module.scss';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const mediaInputRef = useRef(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Kích thước tối đa là 10MB');
      return;
    }

    setMediaFile(file);

    // Determine media type
    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('file');
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };
  
  const triggerMediaUpload = (acceptTypes) => {
    if (mediaInputRef.current) {
      mediaInputRef.current.accept = acceptTypes;
      mediaInputRef.current.click();
    }
  };
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate content
    if (!content.trim()) {
      toast.error('Nội dung bài viết không được để trống');
      return;
    }

    try {
      setIsSubmitting(true);

      let mediaUrl = null;
      let mediaType = null;
      let mediaPublicId = null;

      if (mediaFile) {
        // Determine media type for upload
        let uploadMediaType = "file";        if (mediaFile.type.startsWith('image/')) {
          uploadMediaType = "image";
        } else if (mediaFile.type.startsWith('video/')) {
          uploadMediaType = "video";
        } else {
          uploadMediaType = "file"; // For other document types
        }
        
        const uploadResult = await postService.uploadMedia(mediaFile, uploadMediaType);
        
        // Check if we got a successful upload with a mediaUrl
        if (uploadResult && uploadResult.mediaUrl) {
          mediaUrl = uploadResult.mediaUrl;
          mediaType = uploadMediaType; // Use the determined media type
          mediaPublicId = uploadResult.publicId;
        } else {
          throw new Error(uploadResult.message || 'Không thể tải lên media');
        }
      }

      const postData = {
        content,
        mediaUrl,
        mediaType,
        mediaPublicId
      };
      
      const newPost = await postService.createPost(postData);
      
      // Reset form
      setContent('');
      setMediaFile(null);
      setMediaPreview('');
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      toast.success('Bài viết đã được tạo thành công!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error(error.message || 'Không thể tạo bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }  return (
    <Card className={`${styles.createPostCard} ${styles.animate}`} data-aos="fade-in">
      <Card.Body className="p-0">
        <Form className={styles.postForm} onSubmit={handleSubmit}>
          <div className={styles.userSection}>
            <Image 
              src={user.profilePictureUrl || '/images/default-avatar.png'} 
              className={styles.avatar}
              roundedCircle 
            />
            <Form.Group className={styles.textareaWrapper}>
              <Form.Control
                as="textarea"
                placeholder={`Bạn đang nghĩ gì, ${user.firstName || user.username}?`}
                value={content}
                onChange={handleContentChange}
                className={styles.textarea}
                rows={mediaPreview ? 2 : 3}
                disabled={isSubmitting}
              />
            </Form.Group>
          </div>          {mediaPreview && (
            <div className={styles.mediaPreviewContainer}>
              {mediaType === 'image' ? (
                <Image 
                  src={mediaPreview} 
                  alt="Preview" 
                  className={styles.mediaPreview}
                />
              ) : mediaType === 'video' ? (
                <video 
                  className={styles.videoPreview}
                  controls
                >
                  <source src={mediaPreview} type={mediaFile.type} />
                  Your browser does not support the video tag.
                </video>
              ) : mediaType === 'file' ? (
                <div className={styles.filePreview}>
                  <div>
                    <FaFile className={styles.fileIcon} />
                    <p className={styles.fileName}>{mediaFile.name}</p>
                    <small className={styles.fileSize}>({Math.round(mediaFile.size / 1024)} KB)</small>
                  </div>
                </div>
              ) : null}              <Button 
                variant="light"
                className={styles.removeButton}
                onClick={removeMedia}
              >
                <FaTimes className={styles.closeIcon} />
              </Button>
            </div>
          )}          <div className={styles.formFooter}>
            <div className={styles.mediaButtons}>
              {/* Image upload button */}              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên hình ảnh</Tooltip>}
              >                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.imageBtn}`}
                  onClick={() => triggerMediaUpload('image/*')}
                  disabled={isSubmitting}
                >
                  <FaImage className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>
              
              {/* Video upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên video</Tooltip>}
              >                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.videoBtn}`}
                  onClick={() => triggerMediaUpload('video/*')}
                  disabled={isSubmitting}
                >
                  <FaVideo className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>
              
              {/* File upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên tập tin</Tooltip>}
              >                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.fileBtn}`}
                  onClick={() => triggerMediaUpload('.pdf,.doc,.docx,.xls,.xlsx,.txt')}
                  disabled={isSubmitting}
                >
                  <FaFile className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>
              
              {/* Hidden file input */}
              <Form.Control
                ref={mediaInputRef}
                type="file"
                onChange={handleMediaChange}
                className={styles.hiddenInput}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              className={styles.postButton}
              disabled={isSubmitting || (!content.trim() && !mediaFile)}
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className={styles.spinner} role="status" aria-hidden="true" />
                  <span>Đang đăng...</span>
                </>
              ) : (
                <>                  <FaPaperPlane className={`${styles.icon} ${styles.mediaIcon}`} />
                  <span>Đăng bài</span>
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreatePost;
