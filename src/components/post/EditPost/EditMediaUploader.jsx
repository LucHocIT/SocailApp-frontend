import React, { useRef, useState, useCallback } from 'react';
import { Button, Image, OverlayTrigger, Tooltip, Card, ProgressBar, Alert, Badge } from 'react-bootstrap';
import { 
  FaImage, 
  FaVideo, 
  FaFile, 
  FaTimes, 
  FaCloudUploadAlt, 
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from '../styles/EditPostModal.module.scss';

const EditMediaUploader = ({ 
  mediaFiles = [], 
  setMediaFiles,
  existingMediaFiles = [],
  setExistingMediaFiles,
  isSubmitting = false
}) => {
  const mediaInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Enhanced file validation
  const validateFile = useCallback((file) => {
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 10 * 1024 * 1024; // 10MB for images
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file.type.startsWith('image/')) {
      if (!allowedImageTypes.includes(file.type)) {
        toast.error(`Định dạng ảnh ${file.type} không được hỗ trợ`);
        return false;
      }
      if (file.size > maxImageSize) {
        toast.error(`Ảnh ${file.name} quá lớn. Kích thước tối đa là 10MB`);
        return false;
      }
    } else if (file.type.startsWith('video/')) {
      if (!allowedVideoTypes.includes(file.type)) {
        toast.error(`Định dạng video ${file.type} không được hỗ trợ`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`Video ${file.name} quá lớn. Kích thước tối đa là 50MB`);
        return false;
      }
    } else {
      if (!allowedDocTypes.includes(file.type)) {
        toast.error(`Định dạng file ${file.type} không được hỗ trợ`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 50MB`);
        return false;
      }
    }

    return true;
  }, []);
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
      if (!validateFile(file)) {
        continue;
      }

      let mediaType = 'file';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      }

      const previewUrl = URL.createObjectURL(file);
      
      validFiles.push({
        file,
        mediaType,
        previewUrl,
        filename: file.name,
        id: Date.now() + Math.random() // Unique ID for tracking
      });
    }

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
      toast.success(`Đã thêm ${validFiles.length} file media`);
    }
    
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };
  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleMediaChange({ target: { files } });
    }
  }, [handleMediaChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);
  
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
      toast.info('Đã xóa media từ bài viết');
    } else {
      setMediaFiles(prev => {
        const newFiles = [...prev];
        if (newFiles[index]?.previewUrl) {
          URL.revokeObjectURL(newFiles[index].previewUrl);
        }
        newFiles.splice(index, 1);
        return newFiles;
      });
      toast.info('Đã xóa media mới');
    }
  };

  // Enhanced video component with controls
  const VideoPreview = ({ media, onError }) => {
    return (
      <div className={styles.videoContainer}>
        <video 
          className={styles.videoPreview}
          controls
          preload="metadata"
          muted
          onError={onError}
          onLoadStart={() => console.log('Video load started')}
          onLoadedData={() => console.log('Video loaded successfully')}
        >
          <source src={media.mediaUrl || media.previewUrl} type={media.mediaMimeType || media.file?.type || 'video/mp4'} />
          <source src={media.mediaUrl || media.previewUrl} type="video/webm" />
          <source src={media.mediaUrl || media.previewUrl} type="video/ogg" />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
        {onError && (
          <div className={styles.videoFallback}>
            <FaVideo className={styles.videoIcon} />
            <p>Không thể tải video</p>
            <Button size="sm" variant="outline-primary" onClick={() => window.open(media.mediaUrl || media.previewUrl, '_blank')}>
              <FaEye /> Xem trong tab mới
            </Button>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className={styles.mediaUploaderContainer}>
      {/* Upload Area */}
      <div 
        className={`${styles.uploadDropZone} ${dragActive ? styles.dragActive : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={styles.uploadContent}>
          <FaCloudUploadAlt className={styles.uploadIcon} />
          <h6>Kéo thả file vào đây hoặc</h6>
          <div className={styles.uploadButtons}>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Tải lên hình ảnh (JPG, PNG, GIF, WebP)</Tooltip>}
            >
              <Button 
                variant="outline-primary" 
                size="sm"
                className={styles.uploadButton}
                onClick={() => triggerMediaUpload('image/*')}
                disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
              >
                <FaImage /> Ảnh
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Tải lên video (MP4, WebM, OGG)</Tooltip>}
            >
              <Button 
                variant="outline-success" 
                size="sm"
                className={styles.uploadButton}
                onClick={() => triggerMediaUpload('video/*')}
                disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
              >
                <FaVideo /> Video
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Tải lên tài liệu (PDF, DOC, DOCX)</Tooltip>}
            >
              <Button 
                variant="outline-info" 
                size="sm"
                className={styles.uploadButton}
                onClick={() => triggerMediaUpload('.pdf,.doc,.docx')}
                disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
              >
                <FaFile /> Tài liệu
              </Button>
            </OverlayTrigger>
          </div>
          <small className={styles.uploadHint}>
            Tối đa 10 file. Ảnh ≤ 10MB, Video ≤ 50MB
          </small>
        </div>
      </div>

      {/* Media Preview Grid */}
      {(existingMediaFiles.length > 0 || mediaFiles.length > 0) && (
        <div className={styles.mediaPreviewSection}>
          <div className={styles.mediaGrid}>
            {/* Existing Media Files */}
            {existingMediaFiles.map((media, index) => (
              <Card key={`existing-${index}`} className={styles.mediaCard}>
                <div className={styles.mediaCardHeader}>
                  <Badge bg="secondary" className={styles.mediaBadge}>
                    Hiện tại
                  </Badge>
                  <Button 
                    variant="outline-danger"
                    size="sm"
                    className={styles.removeButton}
                    onClick={() => removeMediaFile(index, true)}
                    disabled={isSubmitting}
                  >
                    <FaTimes />
                  </Button>
                </div>
                
                <Card.Body className={styles.mediaCardBody}>
                  {media.mediaType === 'image' ? (
                    <div className={styles.imageContainer}>
                      <Image 
                        src={media.mediaUrl} 
                        alt="Existing media" 
                        className={styles.mediaPreview}
                        fluid
                      />
                      <div className={styles.imageOverlay}>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => window.open(media.mediaUrl, '_blank')}
                        >
                          <FaExpand />
                        </Button>
                      </div>
                    </div>
                  ) : media.mediaType === 'video' ? (
                    <VideoPreview media={media} />
                  ) : (
                    <div className={styles.filePreview}>
                      <FaFile className={styles.fileIcon} />
                      <div className={styles.fileInfo}>
                        <p className={styles.fileName}>{media.mediaFilename || 'Document'}</p>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={media.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaDownload /> Tải xuống
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}

            {/* New Media Files */}
            {mediaFiles.map((media, index) => (
              <Card key={`new-${index}`} className={styles.mediaCard}>
                <div className={styles.mediaCardHeader}>
                  <Badge bg="success" className={styles.mediaBadge}>
                    Mới
                  </Badge>
                  <Button 
                    variant="outline-danger"
                    size="sm"
                    className={styles.removeButton}
                    onClick={() => removeMediaFile(index, false)}
                    disabled={isSubmitting}
                  >
                    <FaTimes />
                  </Button>
                </div>
                
                <Card.Body className={styles.mediaCardBody}>
                  {media.mediaType === 'image' ? (
                    <div className={styles.imageContainer}>
                      <Image 
                        src={media.previewUrl} 
                        alt="Preview" 
                        className={styles.mediaPreview}
                        fluid
                      />
                      <div className={styles.imageOverlay}>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => window.open(media.previewUrl, '_blank')}
                        >
                          <FaExpand />
                        </Button>
                      </div>
                    </div>
                  ) : media.mediaType === 'video' ? (
                    <VideoPreview media={media} />
                  ) : (
                    <div className={styles.filePreview}>
                      <FaFile className={styles.fileIcon} />
                      <div className={styles.fileInfo}>
                        <p className={styles.fileName}>{media.filename}</p>
                        <small className={styles.fileSize}>
                          {Math.round(media.file.size / 1024)} KB
                        </small>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Upload Progress Information */}
          {(existingMediaFiles.length + mediaFiles.length) >= 8 && (
            <Alert variant="warning" className={styles.warningAlert}>
              <strong>Cảnh báo:</strong> Bạn đã tải lên {existingMediaFiles.length + mediaFiles.length}/10 file. 
              Chỉ còn {10 - (existingMediaFiles.length + mediaFiles.length)} file có thể thêm.
            </Alert>
          )}
        </div>
      )}

      {/* Empty State */}
      {existingMediaFiles.length === 0 && mediaFiles.length === 0 && (
        <div className={styles.emptyState}>
          <FaImage className={styles.emptyIcon} />
          <p>Chưa có media nào được thêm</p>
          <small>Thêm ảnh, video hoặc tài liệu để làm phong phú nội dung bài viết</small>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={handleMediaChange}
        style={{ display: 'none' }}
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
      />
    </div>
  );
};

export default EditMediaUploader;
