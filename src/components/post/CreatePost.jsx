import React, { useState } from 'react';
import { Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { FaImage, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context';
import postService from '../../services/postService';
import styles from './Post.module.scss';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !mediaFile) {
      toast.error('Vui lòng nhập nội dung hoặc thêm hình ảnh cho bài viết');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // If there's a media file, upload it first
      let mediaUrl = null;
      if (mediaFile) {
        const uploadResult = await postService.uploadMedia(mediaFile);
        if (uploadResult && uploadResult.mediaUrl) {
          mediaUrl = uploadResult.mediaUrl;
        }
      }

      // Create the post
      const postData = {
        content: content.trim(),
        mediaUrl
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
      toast.error('Không thể tạo bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className={styles.createPostCard} data-aos="fade-in">
      <Card.Body>
        <div className={styles.createPostHeader}>
          <Image 
            src={user.profilePictureUrl || '/images/default-avatar.png'} 
            className={styles.avatar} 
            roundedCircle 
          />
          <Form className={styles.createPostForm} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                placeholder={`Bạn đang nghĩ gì, ${user.firstName || user.username}?`}
                value={content}
                onChange={handleContentChange}
                className={styles.postInput}
                rows={3}
                disabled={isSubmitting}
              />
            </Form.Group>

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
              <div className={styles.mediaUpload}>
                <label htmlFor="media-upload" className={styles.mediaUploadLabel}>
                  <FaImage /> Hình ảnh/Video
                </label>
                <Form.Control
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className={styles.mediaUploadInput}
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
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Đang đăng...</span>
                  </>
                ) : 'Đăng bài'}
              </Button>
            </div>
          </Form>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CreatePost;
