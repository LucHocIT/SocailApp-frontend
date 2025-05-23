import React, { useState } from 'react';
import { Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { FaImage, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context';
import postService from '../../services/postService';

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
    if (!file) return;    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Kích thước tối đa là 10MB');
      return;
    }

    setMediaFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
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
        let uploadMediaType = "file";
        if (mediaFile.type.startsWith('image/')) {
          uploadMediaType = "image";
        } else if (mediaFile.type.startsWith('video/')) {
          uploadMediaType = "video";
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
  }

  return (    <Card className="create-post-card" data-aos="fade-in">
      <Card.Body>
        <div className="create-post-header">
          <Image 
            src={user.profilePictureUrl || '/images/default-avatar.png'} 
            className="avatar" 
            roundedCircle 
          />
          <Form className="create-post-form" onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                placeholder={`Bạn đang nghĩ gì, ${user.firstName || user.username}?`}
                value={content}
                onChange={handleContentChange}
                className="post-input"
                rows={3}
                disabled={isSubmitting}
              />
            </Form.Group>

            {mediaPreview && (              <div className="media-preview-container">
                {mediaFile.type.startsWith('image/') ? (
                  <Image src={mediaPreview} alt="Preview" className="media-preview" />
                ) : mediaFile.type.startsWith('video/') ? (
                  <video className="media-preview" controls>
                    <source src={mediaPreview} type={mediaFile.type} />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
                <Button variant="danger" size="sm" className="remove-media-button" onClick={removeMedia}>
                  <FaTimes />
                </Button>
              </div>
            )}

            <div className="create-post-footer">
              <div className="media-upload">
                <label htmlFor="media-upload" className="media-upload-label">
                  <FaImage /> Hình ảnh/Video
                </label>
                <Form.Control
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="media-upload-input"
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                className="post-button"
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
