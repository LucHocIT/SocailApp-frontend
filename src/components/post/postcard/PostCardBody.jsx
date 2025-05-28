// PostCard Body Component
import React, { useState } from 'react';
import { Card, Image, Button, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaFile, FaEye } from 'react-icons/fa';
import styles from '../styles/postcard/PostCard.module.scss';

const PostCardBody = ({ post }) => {  const [expanded, setExpanded] = useState(false);
  const [_showImageModal, setShowImageModal] = useState(false);
  const [_selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Check if content is long and should be truncated
  const isLongContent = post.content && post.content.length > 300;
  const showContentToggle = isLongContent;

  // Handle media display
  const renderMedia = () => {
    // Check for multiple media files (backend trả về MediaFiles hoặc mediaFiles)
    const mediaFiles = post.MediaFiles || post.mediaFiles || [];
    
    // Legacy support for single media (MediaUrl, MediaType)
    if (mediaFiles.length === 0 && post.MediaUrl) {
      const legacyMedia = {
        mediaUrl: post.MediaUrl,
        mediaType: post.MediaType,
        fileName: post.FileName || 'Download File'
      };
      return renderSingleMedia([legacyMedia]);
    }
    
    if (mediaFiles.length === 0) return null;

    if (mediaFiles.length === 1) {
      return renderSingleMedia(mediaFiles);
    } else {
      return renderMultipleMedia(mediaFiles);
    }
  };

  // Render single media item
  const renderSingleMedia = (mediaArray) => {
    const item = mediaArray[0];
    
    return (
      <div className={styles.mediaContainer}>
        {(item.mediaType === 'image' || item.MediaType === 'image') && (
          <div className={styles.imageWrapper}>
            <Image 
              src={item.mediaUrl || item.MediaUrl} 
              alt="Post content"
              className={styles.image}
              onClick={() => {
                setSelectedImageIndex(0);
                setShowImageModal(true);
              }}
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}
        {(item.mediaType === 'video' || item.MediaType === 'video') && (
          <div className={styles.videoWrapper}>
            <video 
              className={styles.video}
              controls
              preload="metadata"
            >
              <source src={item.mediaUrl || item.MediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        {(item.mediaType === 'file' || item.MediaType === 'file') && (
          <div className={styles.fileContainer}>
            <a 
              href={item.mediaUrl || item.MediaUrl} 
              className={styles.file}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <FaFile className={styles.fileIcon} />
              <span className={styles.fileName}>
                {item.fileName || item.FileName || item.mediaFilename || 'Download File'}
              </span>
            </a>
          </div>
        )}
      </div>
    );
  };

  // Render multiple media items as grid
  const renderMultipleMedia = (mediaArray) => {
    return (
      <div className={styles.multipleMediaContainer}>
        <div className={`${styles.mediaGrid} ${styles[`grid${Math.min(mediaArray.length, 4)}`]}`}>
          {mediaArray.slice(0, 4).map((media, index) => (
            <div key={index} className={styles.mediaItem}>
              {(media.mediaType === 'image' || media.MediaType === 'image') && (
                <div className={styles.imageWrapper}>                  <Image 
                    src={media.mediaUrl || media.MediaUrl} 
                    alt={`Post media ${index + 1}`} 
                    className={styles.gridImage}
                    loading="lazy"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowImageModal(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className={styles.imageOverlay}>
                    <div className={styles.imageActions}>
                      <div 
                        className={styles.imageAction} 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(media.mediaUrl || media.MediaUrl, '_blank');
                        }}
                        title="Xem ảnh đầy đủ"
                      >
                        <FaEye />
                      </div>
                    </div>
                  </div>
                  {index === 3 && mediaArray.length > 4 && (
                    <div className={styles.moreOverlay}>
                      <span className={styles.moreText}>+{mediaArray.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
              {(media.mediaType === 'video' || media.MediaType === 'video') && (
                <div className={styles.videoWrapper}>
                  <video 
                    className={styles.gridVideo}
                    controls
                    preload="metadata"
                    poster={media.thumbnailUrl}
                  >
                    <source src={media.mediaUrl || media.MediaUrl} type={media.mediaMimeType || 'video/mp4'} />
                    <source src={media.mediaUrl || media.MediaUrl} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                  {media.duration && (
                    <div className={styles.videoDuration}>{media.duration}</div>
                  )}
                  {index === 3 && mediaArray.length > 4 && (
                    <div className={styles.moreOverlay}>
                      <span className={styles.moreText}>+{mediaArray.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
              {(media.mediaType === 'file' || media.MediaType === 'file') && (
                <div className={styles.fileContainer}>
                  <a 
                    href={media.mediaUrl || media.MediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.file}
                  >
                    <FaFile className={styles.fileIcon} /> 
                    <span className={styles.fileName}>
                      {media.fileName || media.FileName || media.mediaFilename || 'Download File'}
                    </span>
                    {media.mediaFileSize && (
                      <Badge bg="light" text="dark" className={styles.fileSize}>
                        {Math.round(media.mediaFileSize / 1024)} KB
                      </Badge>
                    )}
                  </a>
                  {index === 3 && mediaArray.length > 4 && (
                    <div className={styles.moreOverlay}>
                      <span className={styles.moreText}>+{mediaArray.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card.Body className={styles.cardBody}>
      <Card.Text className={styles.postContent}>
        {showContentToggle ? (
          <>
            {expanded ? post.content : `${post.content.slice(0, 300)}...`}
            <Button 
              variant="link" 
              className={styles.readMoreButton}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </Button>
          </>
        ) : post.content}
      </Card.Text>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className={styles.hashtagContainer}>
          {post.hashtags.map((tag, index) => (
            <Badge key={index} bg="light" text="primary" className={styles.hashtag}>
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Location display */}
      {post.location && (
        <div className={styles.locationContainer}>
          <div className={styles.locationDisplay}>
            <FaMapMarkerAlt className={styles.locationIcon} />
            <span className={styles.locationText}>{post.location}</span>
          </div>
        </div>
      )}

      {/* Media display */}
      {renderMedia()}
    </Card.Body>
  );
};

export default PostCardBody;
