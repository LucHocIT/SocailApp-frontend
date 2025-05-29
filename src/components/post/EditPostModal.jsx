import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaTimes, FaFile, FaVideo, FaSave, FaEdit, FaMapMarkerAlt, FaAt, FaHashtag, FaRegSmile, FaPlus } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import styles from './styles/EditPostModal.module.scss';

const EditPostModal = ({ show, post, onHide, onSave }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMediaFiles, setExistingMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
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
  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setLocation(post.location || '');
      setShowEmojiPicker(false);
      setMediaFiles([]);
      
      // Set existing media files - handle multiple media files
      const mediaFiles = post.MediaFiles || post.mediaFiles || [];
      
      if (mediaFiles.length > 0) {
        // Handle multiple media files
        const existingMedia = mediaFiles.map((media, index) => ({
          mediaUrl: media.mediaUrl || media.MediaUrl,
          mediaType: media.mediaType || media.MediaType,
          mediaPublicId: media.mediaPublicId || media.MediaPublicId,
          mediaMimeType: media.mediaMimeType || media.MediaMimeType,
          mediaFilename: media.mediaFilename || media.MediaFilename,
          isExisting: true,
          orderIndex: index
        }));
        setExistingMediaFiles(existingMedia);
      } else if (post.mediaUrl) {
        // Legacy support for single media
        setExistingMediaFiles([{
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          mediaPublicId: post.mediaPublicId,
          mediaMimeType: post.mediaMimeType,
          mediaFilename: post.mediaFilename,
          isExisting: true,
          orderIndex: 0
        }]);
      } else {
        setExistingMediaFiles([]);
      }
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

  const removeLocation = () => {
    setLocation('');
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate total files count including existing
    const totalFiles = mediaFiles.length + existingMediaFiles.length + files.length;
    if (totalFiles > 10) {
      toast.error('Tối đa 10 file media cho mỗi bài viết');
      return;
    }

    const validFiles = [];
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 10MB`);
        continue;
      }

      let mediaType = 'file';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`Video ${file.name} quá lớn. Kích thước tối đa cho video là 50MB`);
          continue;
        }
      }

      const previewUrl = URL.createObjectURL(file);
      
      validFiles.push({
        file,
        mediaType,
        previewUrl,
        filename: file.name,
        isNew: true
      });
    }

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
    }
    
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };
  
  const triggerMediaUpload = (acceptTypes) => {
    if (mediaInputRef.current) {
      mediaInputRef.current.accept = acceptTypes;
      mediaInputRef.current.multiple = true;
      mediaInputRef.current.click();
    }
  };

  const removeMediaFile = (index, isExisting = false) => {
    if (isExisting) {
      setExistingMediaFiles(prev => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);
        return newFiles;
      });
    } else {
      setMediaFiles(prev => {
        const newFiles = [...prev];
        URL.revokeObjectURL(newFiles[index].previewUrl);
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const hasContent = content.trim();
    const hasNewMedia = mediaFiles.length > 0;
    const hasExistingMedia = existingMediaFiles.length > 0;

    if (!hasContent && !hasNewMedia && !hasExistingMedia) {
      toast.error('Vui lòng thêm nội dung hoặc media cho bài viết');
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedMediaFiles = [];

      // Upload new media files if any
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
            orderIndex: existingMediaFiles.length + index
          }));
        } else {
          throw new Error(uploadResult?.message || 'Không thể tải lên media files');
        }
      }

      // Combine existing and new media files
      const allMediaFiles = [
        ...existingMediaFiles.map((media, index) => ({
          ...media,
          orderIndex: index
        })),
        ...uploadedMediaFiles
      ];

      const updateData = {
        content: content.trim(),
        location: location || null,
        mediaFiles: allMediaFiles
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
    <Modal show={show} onHide={onHide} centered size="xl" className={styles.editModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEdit className={styles.titleIcon} /> Chỉnh sửa bài viết
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.content}>
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
              </Button>
              <Button
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

          {/* Emoji picker - positioned absolutely */}
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
          {(existingMediaFiles.length > 0 || mediaFiles.length > 0) && (
            <div className={styles.mediaPreviewContainer}>
              <div className={styles.mediaGrid}>
                {/* Existing media files */}
                {existingMediaFiles.map((media, index) => (
                  <div key={`existing-${index}`} className={styles.mediaItem}>
                    {media.mediaType === 'image' ? (
                      <Image 
                        src={media.mediaUrl} 
                        alt="Existing media" 
                        className={styles.mediaPreview}
                      />
                    ) : media.mediaType === 'video' ? (
                      <video 
                        className={styles.videoPreview}
                        controls
                      >
                        <source src={media.mediaUrl} type={media.mediaMimeType || 'video/mp4'} />
                        Trình duyệt của bạn không hỗ trợ thẻ video.
                      </video>
                    ) : (
                      <div className={styles.filePreview}>
                        <div>
                          <FaFile className={styles.fileIcon} />
                          <p className={styles.fileName}>{media.mediaFilename || 'File'}</p>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="light"
                      className={styles.removeButton}
                      onClick={() => removeMediaFile(index, true)}
                      type="button"
                    >
                      <FaTimes className={styles.closeIcon} />
                    </Button>
                  </div>
                ))}

                {/* New media files */}
                {mediaFiles.map((media, index) => (
                  <div key={`new-${index}`} className={styles.mediaItem}>
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
                        Trình duyệt của bạn không hỗ trợ thẻ video.
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
                      onClick={() => removeMediaFile(index, false)}
                      type="button"
                    >
                      <FaTimes className={styles.closeIcon} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
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
                  disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
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
                  disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
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
                  disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
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
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
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
