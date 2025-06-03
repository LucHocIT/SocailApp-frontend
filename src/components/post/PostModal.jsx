import React, { useRef } from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import { FaFile, FaDownload, FaLock, FaGlobe, FaUserSecret } from 'react-icons/fa';
import { useAuth } from '../../context/hooks';
import { parseDate } from '../../utils/dateUtils';
import PostReactionButton from './reactions/PostReactionButton';
import { CommentForm, CommentList } from '../../components/comment';
import styles from './styles/PostModal.module.scss';

const PostModal = ({ show, onHide, post }) => {
  const { user } = useAuth();
  const commentListRef = useRef(null);

  // Handler for when a new comment is added
  const handleCommentAdded = (newComment) => {
    // Update the comment count in the header
    if (post.commentsCount !== undefined) {
      post.commentsCount += 1;
    }
    // Add the new comment to the CommentList
    if (commentListRef.current) {
      commentListRef.current.handleCommentAdded(newComment);
    }
  };

  // Get media files array - support both new format (MediaFiles) and legacy format (mediaUrl)
  const getMediaFiles = () => {
    // Check for new format with multiple media files
    const mediaFiles = post.MediaFiles || post.mediaFiles || [];
    if (mediaFiles.length > 0) {
      return mediaFiles.map((media, index) => ({
        mediaUrl: media.MediaUrl || media.mediaUrl,
        mediaType: media.MediaType || media.mediaType,
        mediaMimeType: media.MediaMimeType || media.mediaMimeType,
        mediaFilename: media.MediaFilename || media.mediaFilename,
        orderIndex: media.OrderIndex || media.orderIndex || index
      })).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }
    
    // Fallback to legacy single media format
    if (post.mediaUrl) {
      return [{
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        mediaMimeType: post.mediaMimeType,
        mediaFilename: post.mediaFilename,
        orderIndex: 0
      }];
    }
    
    return [];
  };

  const mediaFiles = getMediaFiles();

  // Render media files
  const renderMediaFiles = () => {
    if (mediaFiles.length === 0) return null;

    return (
      <div className={styles.mediaContainer}>
        {mediaFiles.length === 1 ? (
          // Single media display
          renderSingleMedia(mediaFiles[0])
        ) : (
          // Multiple media grid display
          <div className={styles.multipleMediaContainer}>
            <div className={`${styles.mediaGrid} ${styles[`grid${Math.min(mediaFiles.length, 4)}`]}`}>
              {mediaFiles.slice(0, 4).map((media, index) => (
                <div key={index} className={styles.mediaItem}>
                  {renderMediaItem(media, index)}
                  {index === 3 && mediaFiles.length > 4 && (
                    <div className={styles.moreOverlay}>
                      <span className={styles.moreText}>+{mediaFiles.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render single media item
  const renderSingleMedia = (media) => {
    if (media.mediaType === 'image') {
      return (
        <Image 
          src={media.mediaUrl} 
          alt="Post media" 
          className={styles.postImage}
          fluid={true} 
        />
      );    } else if (media.mediaType === 'video') {
      return (
        <div className={styles.videoWrapper}>
          <video 
            className={styles.postVideo}
            controls
            preload="metadata"
            onError={(e) => {
              console.error('Video load error in modal:', e);
              e.target.style.display = 'none';
              const fallback = e.target.parentNode.querySelector('.video-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          >
            <source src={media.mediaUrl} type={media.mediaMimeType || 'video/mp4'} />
            <source src={media.mediaUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <div className={styles.videoFallback} style={{display: 'none'}}>
            <div className={styles.fallbackContent}>
              <p>Video không thể phát được</p>
              <a href={media.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Tải xuống video
              </a>
            </div>
          </div>
        </div>
      );
    } else {
      return renderFilePreview(media);
    }
  };
  // Render media item for grid
  const renderMediaItem = (media, index) => {
    if (media.mediaType === 'image') {
      return (
        <Image 
          src={media.mediaUrl} 
          alt={`Post media ${index + 1}`} 
          className={styles.gridImage}
          loading="lazy"
        />
      );
    } else if (media.mediaType === 'video') {
      return (
        <div className={styles.videoWrapper}>
          <video 
            className={styles.gridVideo}
            controls
            preload="metadata"
            poster={media.thumbnailUrl}
          >
            <source src={media.mediaUrl} type={media.mediaMimeType || 'video/mp4'} />
            <source src={media.mediaUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          {media.duration && (
            <div className={styles.videoDuration}>{media.duration}</div>
          )}
        </div>
      );
    } else {
      return renderFilePreview(media);
    }
  };

  // Render file preview
  const renderFilePreview = (media) => {
    return (
      <div className={styles.filePreview}>
        <FaFile className={styles.fileIcon} />
        <div className={styles.fileInfo}>
          <p className={styles.fileName}>{media.mediaFilename || 'File'}</p>
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
    );
  };

  return (    <Modal 
      show={show} 
      onHide={onHide} 
      dialogClassName={styles.modalDialog}
      contentClassName={styles.modalContent}
      centered={true}
      fullscreen="lg-down"
      size="xl" // Ensure Bootstrap uses largest size class
      aria-labelledby="post-modal"
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title id="post-modal">
          <Link to={`/profile/${post.username}`} className={styles.headerUserInfo}>            <Image 
              src={post.profilePictureUrl || '/images/default-avatar.png'}
              className={styles.headerAvatar} 
              roundedCircle={true} 
            />            <div className={styles.headerUserText}>
              <span className={styles.headerUsername}>{post.username}</span>              <span className={styles.headerTime}>
                <TimeAgo date={parseDate(post.createdAt)} />
                {(post.privacyLevel > 0 || post.PrivacyLevel > 0) && (
                  <span className={styles.privacyIndicator} title={
                    (post.privacyLevel === 2 || post.PrivacyLevel === 2) ? "Bài viết bí mật" : 
                    (post.privacyLevel === 1 || post.PrivacyLevel === 1) ? "Bài viết riêng tư" : 
                    "Bài viết công khai"
                  }>
                    {(post.privacyLevel === 2 || post.PrivacyLevel === 2) ? (
                      <FaUserSecret className={styles.privacyIcon} />
                    ) : (
                      <FaLock className={styles.privacyIcon} />
                    )}
                  </span>
                )}
              </span>
            </div>
          </Link>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>        <div className={styles.contentSection}>
          <p className={styles.postText}>{post.content}</p>
          
          {renderMediaFiles()}

          <div className={styles.actionsContainer}>
            <div className={styles.reactionContainer}>
              <PostReactionButton postId={post.id} />
            </div>
          </div>
        </div>

        <div className={styles.commentsSection}>
          <h5 className={styles.commentsSectionTitle}>Bình luận ({post.commentsCount || 0})</h5>
          
          <CommentList 
            ref={commentListRef}
            postId={post.id} 
            commentsCount={post.commentsCount} 
          />
        </div>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        {user ? (
          <CommentForm 
            postId={post.id} 
            onCommentAdded={handleCommentAdded}
          />
        ) : (
          <div className={styles.loginPrompt}>
            <p>Vui lòng đăng nhập để bình luận</p>
            <Button variant="primary" onClick={onHide}>Đăng nhập</Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PostModal;
