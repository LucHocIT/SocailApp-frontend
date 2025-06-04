import React, { useRef } from 'react';
import { Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaImage, FaVideo, FaFile, FaPlus, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from '../styles/CreatePost.module.scss';

const MediaUploader = ({ 
  mediaFiles = [], 
  setMediaFiles, 
  isSubmitting = false
}) => {
  const mediaInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (mediaFiles.length + files.length > 10) {
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
  const removeMediaFile = (index) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <>
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
                  <video className={styles.videoPreview} controls>
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
      )}

      {/* Media upload buttons */}
      <div className={styles.mediaButtons}>
        <OverlayTrigger placement="top" overlay={<Tooltip>Tải lên hình ảnh</Tooltip>}>
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
        
        <OverlayTrigger placement="top" overlay={<Tooltip>Tải lên video</Tooltip>}>
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
        
        <OverlayTrigger placement="top" overlay={<Tooltip>Tải lên tập tin</Tooltip>}>
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

        <OverlayTrigger placement="top" overlay={<Tooltip>Tải lên nhiều file</Tooltip>}>
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

export default MediaUploader;
