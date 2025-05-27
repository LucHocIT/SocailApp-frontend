import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaTimes, FaFile, FaVideo, FaSave, FaEdit, FaMapMarkerAlt, FaAt, FaHashtag, FaRegSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import styles from './styles/EditPostModal.module.scss';

const EditPostModal = ({ show, post, onHide, onSave }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [existingMediaUrl, setExistingMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const mediaInputRef = useRef(null);
  const textareaRef = useRef(null);
  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setExistingMediaUrl(post.mediaUrl || '');
      setMediaFile(null);
      setMediaPreview('');
      setRemoveExistingMedia(false);
      setLocation(post.location || '');
      setMediaType(post.mediaType || null);
      setShowEmojiPicker(false);
    }
  }, [post]);

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

  // Function để lấy vị trí
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
            const address = data.display_name.split(',').slice(0, 3).join(', ');
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

  const removeLocation = () => {
    setLocation('');
  };

  // New method to trigger file upload with specific types
  const triggerMediaUpload = (acceptTypes) => {
    if (mediaInputRef.current) {
      mediaInputRef.current.accept = acceptTypes;
      mediaInputRef.current.click();
    }
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
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setRemoveExistingMedia(true);
    setMediaType(null);
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile && !existingMediaUrl) {
      toast.error('Vui lòng thêm nội dung hoặc phương tiện cho bài viết của bạn');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let mediaUrl = null;
      let mediaType = null;
      let mediaPublicId = null;

      // Nếu có file media mới
      if (mediaFile) {
        // Xác định loại media để upload
        let uploadMediaType = "file";
        if (mediaFile.type.startsWith('image/')) {
          uploadMediaType = "image";
        } else if (mediaFile.type.startsWith('video/')) {
          uploadMediaType = "video";
        }
        
        // Upload media mới
        const uploadResult = await postService.uploadMedia(mediaFile, uploadMediaType);
        
        if (uploadResult && uploadResult.mediaUrl) {
          mediaUrl = uploadResult.mediaUrl;
          mediaType = uploadMediaType;
          mediaPublicId = uploadResult.publicId;
        } else {
          throw new Error(uploadResult.message || 'Không thể tải lên media');
        }
      }      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        content: content,
        mediaUrl: mediaUrl || (removeExistingMedia ? null : existingMediaUrl),
        mediaType: mediaType || (removeExistingMedia ? null : post.mediaType),
        mediaPublicId: mediaPublicId || (removeExistingMedia ? null : post.mediaPublicId),
        location: location || null
      };

      const updatedPost = await postService.updatePost(post.id, updateData);
      onSave(updatedPost);
      toast.success('Bài viết đã được cập nhật thành công!');
      onHide();
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      toast.error(error.message || 'Lỗi khi cập nhật bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <Modal show={show} onHide={onHide} centered size="lg" className={styles.editModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEdit className={styles.titleIcon} /> Chỉnh sửa bài viết
        </Modal.Title>
      </Modal.Header>      <Modal.Body className={styles.content}>
        <Form onSubmit={handleSubmit} className={styles.editorContainer}>
          <div className={styles.textareaWrapper}>
            <Form.Control
              ref={textareaRef}
              as="textarea"
              value={content}
              onChange={handleContentChange}
              className={styles.textarea}
              placeholder="Bạn đang nghĩ gì?"
              rows={4}
            />
            
            {/* Content tools - Icons trong textarea */}
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
          </div>

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
          )}          {(mediaFile || existingMediaUrl) && (
            <div className={styles.mediaPreviewContainer}>
              {mediaFile ? (
                <>
                  {mediaType === 'image' ? (
                    <Image src={mediaPreview} alt="Preview" 
                      className={styles.mediaItem}
                    />
                  ) : mediaType === 'video' ? (
                    <video 
                      className={styles.videoItem}
                      controls
                    >
                      <source src={mediaPreview} type={mediaFile.type} />
                      Trình duyệt của bạn không hỗ trợ thẻ video.
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
                </>
              ) : existingMediaUrl && !removeExistingMedia ? (
                <>
                  {post.mediaType === 'image' ? (
                    <Image 
                      src={existingMediaUrl} 
                      alt="Current media" 
                      className={styles.mediaItem} 
                    />
                  ) : post.mediaType === 'video' ? (
                    <video 
                      className={styles.videoItem}
                      controls
                    >
                      <source src={existingMediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                      Trình duyệt của bạn không hỗ trợ thẻ video.
                    </video>
                  ) : (
                    <div className={styles.filePreview}>
                      <a 
                        href={existingMediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.fileLink}
                      >
                        <FaFile /> {post.mediaFilename || 'Tải xuống tập tin'}
                      </a>
                    </div>
                  )}
                </>
              ) : null}
              {(mediaFile || (existingMediaUrl && !removeExistingMedia)) && (
                <Button
                  variant="light"
                  className={styles.removeButton}
                  onClick={handleRemoveMedia}
                >
                  <FaTimes />
                </Button>
              )}
            </div>
          )}          <div className={styles.mediaToolbar}>
            <div className={styles.mediaButtons}>
              {/* Image upload button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Tải lên hình ảnh</Tooltip>}
              >
                <Button 
                  variant="light" 
                  className={`${styles.mediaButton} ${styles.imageButton}`}
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
                  className={`${styles.mediaButton} ${styles.videoButton}`}
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
                  className={`${styles.mediaButton} ${styles.fileButton}`}
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
                  className={`${styles.mediaButton} ${styles.locationButton}`}
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
              
              <Form.Control
                type="file"
                onChange={handleMediaChange}
                className={styles.hiddenInput}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                ref={mediaInputRef}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </Form>
      </Modal.Body>      <Modal.Footer className={styles.footer}>
        <Button
          variant="light"
          onClick={onHide}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className={styles.saveButton}
          disabled={isSubmitting}
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
              <FaSave className={styles.icon} />
              <span>Lưu thay đổi</span>
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal;
