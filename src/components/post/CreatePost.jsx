import React, { useState, useRef } from 'react';
import { Card, Form, Button, Image, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaTimes, FaVideo, FaFile, FaPaperPlane, FaMapMarkerAlt, FaAt, FaHashtag, FaRegSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/hooks';
import postService from '../../services/postService';
import styles from './styles/CreatePost.module.scss';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const mediaInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleEmojiClick = (emojiData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setContent(before + emojiData.emoji + after);
    setShowEmojiPicker(false);
    
    // Focus lại textarea và đặt cursor sau emoji
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiData.emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Thêm function để lấy vị trí
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Gọi API để lấy tên địa điểm
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            const address = data.display_name.split(',').slice(0, 3).join(', '); // Lấy 3 phần đầu của địa chỉ
            setLocation(address);
            toast.success('Đã xác định vị trí thành công');
          } else {
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Không thể lấy vị trí hiện tại');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };
  // Function để chèn text vào vị trí cursor
  const insertTextAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    
    setContent(newContent);
    
    // Đặt lại vị trí cursor
    setTimeout(() => {
      const newCursorPos = start + textToInsert.length;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  const insertMention = () => {
    insertTextAtCursor('@');
  };

  const insertHashtag = () => {
    insertTextAtCursor('#');
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Kích thước tối đa là 10MB');
      return;
    }

    setMediaFile(file);

    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('file');
    }

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
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };

  const removeLocation = () => {
    setLocation('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

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
        let uploadMediaType = "file";
        if (mediaFile.type.startsWith('image/')) {
          uploadMediaType = "image";
        } else if (mediaFile.type.startsWith('video/')) {
          uploadMediaType = "video";
        } else {
          uploadMediaType = "file";
        }
        
        const uploadResult = await postService.uploadMedia(mediaFile, uploadMediaType);
        
        if (uploadResult && uploadResult.mediaUrl) {
          mediaUrl = uploadResult.mediaUrl;
          mediaType = uploadMediaType;
          mediaPublicId = uploadResult.publicId;
        } else {
          throw new Error(uploadResult.message || 'Không thể tải lên media');
        }
      }

      const postData = {
        content,
        mediaUrl,
        mediaType,
        mediaPublicId,
        location: location || null
      };
      
      const newPost = await postService.createPost(postData);
      
      // Reset form
      setContent('');
      setMediaFile(null);
      setMediaPreview('');
      setMediaType(null);
      setLocation('');
      
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

  return (
    <Card className={`${styles.createPostCard} ${styles.animate}`} data-aos="fade-in">
      <Card.Body className="p-0">
        <Form className={styles.postForm} onSubmit={handleSubmit}>
          <div className={styles.userSection}>
            <Image 
              src={user.profilePictureUrl || '/images/default-avatar.png'} 
              className={styles.avatar}
              roundedCircle 
            />
            <div className={styles.textareaWrapper}>
              <Form.Control
                ref={textareaRef}
                as="textarea"
                placeholder={`Bạn đang nghĩ gì, ${user.firstName || user.username}?`}
                value={content}
                onChange={handleContentChange}
                className={styles.textarea}
                rows={mediaPreview ? 2 : 3}
                disabled={isSubmitting}
              />              {/* Content tools - Icons trong textarea */}
              <div className={styles.contentTools}>
                {/* Emoji picker button */}
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Thêm emoji</Tooltip>}
                >
                  <Button
                    variant="light"
                    size="sm"
                    className={styles.toolButton}
                    onClick={toggleEmojiPicker}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <FaRegSmile />
                  </Button>
                </OverlayTrigger>
                
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Nhắc đến ai đó</Tooltip>}
                >
                  <Button
                    variant="light"
                    size="sm"
                    className={styles.toolButton}
                    onClick={insertMention}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <FaAt />
                  </Button>
                </OverlayTrigger>
                
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Thêm hashtag</Tooltip>}
                >
                  <Button
                    variant="light"
                    size="sm"
                    className={styles.toolButton}
                    onClick={insertHashtag}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <FaHashtag />
                  </Button>
                </OverlayTrigger>
              </div>
            </div>          </div>

          {/* Inline Emoji Picker */}
          {showEmojiPicker && (
            <div className={styles.emojiPickerContainer}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                theme="light"
                height={350}
                width={300}
                previewConfig={{
                  showPreview: false
                }}
                searchPlaceHolder="Tìm kiếm emoji..."
                skinTonePickerLocation="PREVIEW"
              />
            </div>
          )}

          {/* Location display */}
          {location && (
            <div className={styles.locationContainer}>
              <div className={styles.locationDisplay}>
                <FaMapMarkerAlt className={styles.locationIcon} />
                <span className={styles.locationText}>{location}</span>
                <Button
                  variant="light"
                  size="sm"
                  className={styles.removeLocationBtn}
                  onClick={removeLocation}
                  type="button"
                >
                  <FaTimes />
                </Button>
              </div>
            </div>
          )}

          {/* Media preview */}
          {mediaPreview && (
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
              ) : null}
              
              <Button 
                variant="light"
                className={styles.removeButton}
                onClick={removeMedia}
                type="button"
              >
                <FaTimes className={styles.closeIcon} />
              </Button>
            </div>
          )}

          {/* Form footer với các nút */}
          <div className={styles.formFooter}>
            <div className={styles.mediaButtons}>
              {/* Image upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên hình ảnh</Tooltip>}
              >
                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.imageBtn}`}
                  onClick={() => triggerMediaUpload('image/*')}
                  disabled={isSubmitting}
                  type="button"
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
                  className={`${styles.mediaButton} ${styles.videoBtn}`}
                  onClick={() => triggerMediaUpload('video/*')}
                  disabled={isSubmitting}
                  type="button"
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
                  className={`${styles.mediaButton} ${styles.fileBtn}`}
                  onClick={() => triggerMediaUpload('.pdf,.doc,.docx,.xls,.xlsx,.txt')}
                  disabled={isSubmitting}
                  type="button"
                >
                  <FaFile className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>

              {/* Location button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Thêm vị trí</Tooltip>}
              >
                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.locationBtn}`}
                  onClick={getCurrentLocation}
                  disabled={isSubmitting || isGettingLocation}
                  type="button"
                >
                  {isGettingLocation ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    <FaMapMarkerAlt className={styles.mediaIcon} />
                  )}
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
                <>
                  <FaPaperPlane className={`${styles.icon} ${styles.mediaIcon}`} />
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