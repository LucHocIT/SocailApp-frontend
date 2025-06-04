import React, { useRef } from 'react';
import { Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaVideo, FaFile, FaTimes } from 'react-icons/fa';
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
        filename: file.name
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

  return (
    <>
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
                    <source src={media.mediaUrl} type={media.mediaMimeType} />
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                  </video>
                ) : (
                  <div className={styles.filePreview}>
                    <div>
                      <FaFile className={styles.fileIcon} />
                      <p className={styles.fileName}>{media.mediaFilename}</p>
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

      {/* Media upload buttons */}
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
            overlay={<Tooltip>Tải lên file</Tooltip>}
          >
            <Button 
              variant="light" 
              className={`${styles.mediaButton} ${styles.fileBtn}`}
              onClick={() => triggerMediaUpload('*')}
              disabled={isSubmitting || (mediaFiles.length + existingMediaFiles.length) >= 10}
              type="button"
            >
              <FaFile className={styles.mediaIcon} />
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={handleMediaChange}
        style={{ display: 'none' }}
        multiple
      />
    </>
  );
};

export default EditMediaUploader;
