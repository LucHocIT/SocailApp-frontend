import React, { useState, useRef } from 'react';
import { Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/hooks';
import postService from '../../../services/postService';
import MediaUploader from './MediaUploader';
import PostControls from './PostControls';
import styles from '../styles/CreatePost.module.scss';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState(0);
  const textareaRef = useRef(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Vui lòng thêm nội dung hoặc media cho bài viết');
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedMediaFiles = [];
      
      if (mediaFiles.length > 0) {
        const mediaFilesToUpload = mediaFiles.map(m => m.file);
        const mediaTypes = mediaFiles.map(m => m.mediaType);
        
        const uploadResult = await postService.uploadMultipleMedia(mediaFilesToUpload, mediaTypes);
        
        if (uploadResult && uploadResult.success) {
          uploadedMediaFiles = uploadResult.results.map((result, index) => ({
            mediaUrl: result.mediaUrl,
            mediaType: result.mediaType || mediaTypes[index],
            mediaPublicId: result.publicId,
            mediaMimeType: result.mediaType,
            mediaFilename: result.mediaFilename,
            mediaFileSize: result.fileSize,
            width: result.width,
            height: result.height,
            duration: result.duration,
            orderIndex: index
          }));
        } else {
          throw new Error(uploadResult?.message || 'Không thể tải lên media files');
        }
      }

      const postData = {
        content: content.trim(),
        location: location || null,
        mediaFiles: uploadedMediaFiles,
        privacyLevel: privacyLevel
      };
      
      const newPost = await postService.createPost(postData);
      
      // Reset form
      setContent('');
      setMediaFiles([]);
      setLocation('');
      setPrivacyLevel(0);
      
      // Revoke all object URLs
      mediaFiles.forEach(media => URL.revokeObjectURL(media.previewUrl));
      
      toast.success('Bài viết đã được đăng thành công!');
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Không thể đăng bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={styles.createPostCard}>
      <Card.Body className={styles.cardBody}>
        <Form onSubmit={handleSubmit} className={styles.form}>
          {/* User info */}
          <div className={styles.userInfo}>
            <Image
              src={user?.profilePictureUrl || '/images/default-avatar.png'}
              alt={user?.username}
              className={styles.avatar}
              roundedCircle
            />            <div className={styles.userDetails}>
              <span className={styles.username}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
              </span>
            </div>
          </div>

          {/* Content textarea */}
          <div className={styles.textareaContainer}>
            <Form.Control
              as="textarea"
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Bạn đang nghĩ gì?"
              className={styles.textarea}
              rows={3}
              disabled={isSubmitting}
            />
            
            <PostControls
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

          <MediaUploader
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            isSubmitting={isSubmitting}
          />

          {/* Form footer */}
          <div className={styles.formFooter}>
            <div className={styles.postControls}>
              <Button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className={styles.spinner} role="status" aria-hidden="true" />
                    <span>Đang đăng...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className={`${styles.icon} ${styles.mediaIcon}`} />
                    <span>Đăng bài</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreatePost;
