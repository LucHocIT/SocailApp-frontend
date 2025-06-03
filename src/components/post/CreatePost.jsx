import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Image, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaTimes, FaVideo, FaFile, FaPaperPlane, FaMapMarkerAlt, FaAt, FaHashtag, FaRegSmile, FaPlus, FaLock, FaGlobe, FaUserSecret } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/hooks';
import postService from '../../services/postService';
import styles from './styles/CreatePost.module.scss';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const [privacyLevel, setPrivacyLevel] = useState(0); // 0 = Public, 1 = Private, 2 = Secret
  const mediaInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && 
          emojiButtonRef.current && 
          !emojiButtonRef.current.contains(event.target) &&
          !event.target.closest('.EmojiPickerReact')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiData.emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };
  const toggleEmojiPicker = () => {
    if (!showEmojiPicker && emojiButtonRef.current) {
      const buttonRect = emojiButtonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Calculate position for emoji picker
      let top = buttonRect.bottom + 10;
      let left = buttonRect.left;
      
      // Adjust if picker would go outside viewport
      const pickerWidth = 300;
      const pickerHeight = 400;
      
      if (left + pickerWidth > windowWidth) {
        left = windowWidth - pickerWidth - 20;
      }
      
      if (top + pickerHeight > windowHeight) {
        top = buttonRect.top - pickerHeight - 10;
      }
      
      setEmojiPickerPosition({ top, left });
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

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

  const insertTextAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    
    setContent(newContent);
    
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
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate total files count
    if (mediaFiles.length + files.length > 10) {
      toast.error('Tối đa 10 file media cho mỗi bài viết');
      return;
    }

    const validFiles = [];
    
    for (const file of files) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 10MB`);
        continue;
      }      // Determine media type
      let mediaType = 'file';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
        // Additional validation for video files
        if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
          toast.error(`Video ${file.name} quá lớn. Kích thước tối đa cho video là 50MB`);
          continue;
        }
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      validFiles.push({
        file,
        mediaType,
        previewUrl,
        filename: file.name
      });
    }

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
    }
    
    // Reset input
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };
  
  const triggerMediaUpload = (acceptTypes) => {
    if (mediaInputRef.current) {
      mediaInputRef.current.accept = acceptTypes;
      mediaInputRef.current.multiple = true; // Enable multiple selection
      mediaInputRef.current.click();
    }
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to free memory
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const removeLocation = () => {
    setLocation('');
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

      let uploadedMediaFiles = [];      // Upload multiple media files if any
      if (mediaFiles.length > 0) {
        const mediaFilesToUpload = mediaFiles.map(m => m.file);
        const mediaTypes = mediaFiles.map(m => m.mediaType);
        
        console.log('Uploading media files:', mediaFilesToUpload.length, 'files');
        console.log('Media types:', mediaTypes);
        
        const uploadResult = await postService.uploadMultipleMedia(mediaFilesToUpload, mediaTypes);
        console.log('Upload result:', uploadResult);
        
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
          console.log('Processed uploaded files:', uploadedMediaFiles);
        } else {
          console.error('Upload failed:', uploadResult);
          throw new Error(uploadResult?.message || 'Không thể tải lên media files');
        }
      }      const postData = {
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
      setShowEmojiPicker(false);
      
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
            />
            <div className={styles.userDetails}>
              <span className={styles.username}>{user?.username}</span>
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
            
            {/* Content tools */}
            <div className={styles.contentTools}>
              <Button
                variant="link"
                className={styles.toolButton}
                onClick={insertMention}
                type="button"
                disabled={isSubmitting}
              >
                <FaAt />
              </Button>
              <Button
                variant="link"
                className={styles.toolButton}
                onClick={insertHashtag}
                type="button"
                disabled={isSubmitting}
              >
                <FaHashtag />
              </Button>              <Button
                variant="link"
                className={styles.toolButton}
                onClick={toggleEmojiPicker}
                type="button"
                disabled={isSubmitting}
                ref={emojiButtonRef}
              >
                <FaRegSmile />
              </Button>
            </div>
          </div>

          {/* Emoji picker - moved outside textareaContainer */}
          {showEmojiPicker && (
            <div 
              className={styles.emojiPickerContainer}
              style={{
                position: 'fixed',
                top: `${emojiPickerPosition.top}px`,
                left: `${emojiPickerPosition.left}px`,
                zIndex: 9999
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
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

          {/* Media previews */}
          {mediaFiles.length > 0 && (
            <div className={styles.mediaPreviewContainer}>
              <div className={styles.mediaGrid}>
                {mediaFiles.map((media, index) => (
                  <div key={index} className={styles.mediaItem}>
                    {media.mediaType === 'image' ? (
                      <Image 
                        src={media.previewUrl} 
                        alt="Preview" 
                        className={styles.mediaPreview}
                      />
                    ) : media.mediaType === 'video' ? (
                      <video 
                        className={styles.videoPreview}
                        controls
                      >
                        <source src={media.previewUrl} type={media.file.type} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className={styles.filePreview}>
                        <div>
                          <FaFile className={styles.fileIcon} />
                          <p className={styles.fileName}>{media.filename}</p>
                          <small className={styles.fileSize}>({Math.round(media.file.size / 1024)} KB)</small>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="light"
                      className={styles.removeButton}
                      onClick={() => removeMediaFile(index)}
                      type="button"
                    >
                      <FaTimes className={styles.closeIcon} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}          {/* Privacy setting */}
          <div className={styles.privacySetting}>
            <Button
              variant={privacyLevel === 0 ? 'primary' : 'light'}
              className={`${styles.privacyButton} ${styles.publicButton}`}
              onClick={() => setPrivacyLevel(0)}
              disabled={isSubmitting}
              type="button"
            >
              <FaGlobe className={styles.privacyIcon} />
              Công khai
            </Button>
            <Button
              variant={privacyLevel === 1 ? 'primary' : 'light'}
              className={`${styles.privacyButton} ${styles.privateButton}`}
              onClick={() => setPrivacyLevel(1)}
              disabled={isSubmitting}
              type="button"
            >
              <FaLock className={styles.privacyIcon} />
              Riêng tư
            </Button>
            <Button
              variant={privacyLevel === 2 ? 'primary' : 'light'}
              className={`${styles.privacyButton} ${styles.secretButton}`}
              onClick={() => setPrivacyLevel(2)}
              disabled={isSubmitting}
              type="button"
            >
              <FaUserSecret className={styles.privacyIcon} />
              Bí mật
            </Button>
          </div>

          {/* Form footer */}
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
                  disabled={isSubmitting || mediaFiles.length >= 10}
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
                  disabled={isSubmitting || mediaFiles.length >= 10}
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
                  disabled={isSubmitting || mediaFiles.length >= 10}
                  type="button"
                >
                  <FaFile className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>

              {/* Multiple files upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên nhiều file</Tooltip>}
              >
                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.multipleBtn}`}
                  onClick={() => triggerMediaUpload('*/*')}
                  disabled={isSubmitting || mediaFiles.length >= 10}
                  type="button"
                >
                  <FaPlus className={styles.mediaIcon} />
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
                  <FaMapMarkerAlt className={styles.mediaIcon} />
                </Button>
              </OverlayTrigger>
            </div>            <div className={styles.postControls}>
              {/* Privacy Level Selector */}
              <div className={styles.privacySelector}>
                <Form.Select
                  value={privacyLevel}
                  onChange={(e) => setPrivacyLevel(parseInt(e.target.value))}
                  disabled={isSubmitting}
                  className={styles.privacySelect}
                >
                  <option value={0}>
                    🌍 Công khai - Mọi người có thể xem
                  </option>
                  <option value={1}>
                    🔒 Riêng tư - Chỉ người theo dõi
                  </option>
                  <option value={2}>
                    🤫 Bí mật - Chỉ mình tôi
                  </option>
                </Form.Select>
              </div>

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

        {/* Hidden file input */}
        <input
          type="file"
          ref={mediaInputRef}
          onChange={handleMediaChange}
          style={{ display: 'none' }}
          multiple
        />
      </Card.Body>
    </Card>
  );
};

export default CreatePost;