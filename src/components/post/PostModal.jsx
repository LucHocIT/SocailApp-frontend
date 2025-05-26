import React from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import { useAuth } from '../../context/hooks';
import { convertUtcToLocal } from '../../utils/dateUtils';
import PostReactionButton from './PostReactionButton';
import { CommentForm, CommentList } from '../../components/comment';
import styles from './styles/PostModal.module.scss';

const PostModal = ({ show, onHide, post }) => {
  const { user } = useAuth();

  // No need to manage comment state as CommentList handles this internally
  // No longer need comment handlers as the CommentList component handles these internally

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      dialogClassName={styles.modalDialog}
      contentClassName={styles.modalContent}
      centered
      fullscreen="lg-down"
      size="xl" // Ensure Bootstrap uses largest size class
      aria-labelledby="post-modal"
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title id="post-modal">
          <Link to={`/profile/${post.username}`} className={styles.headerUserInfo}>
            <Image 
              src={post.profilePictureUrl || '/images/default-avatar.png'}
              className={styles.headerAvatar} 
              roundedCircle 
            />
            <div className={styles.headerUserText}>
              <span className={styles.headerUsername}>{post.username}</span>
              <span className={styles.headerTime}>
                <TimeAgo date={convertUtcToLocal(post.createdAt)} />
              </span>
            </div>
          </Link>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <div className={styles.contentSection}>
          <p className={styles.postText}>{post.content}</p>
          
          {post.mediaUrl && (
            <div className={styles.mediaContainer}>
              {post.mediaType === 'image' ? (
                <Image 
                  src={post.mediaUrl} 
                  alt="Post media" 
                  className={styles.postImage}
                  fluid 
                />
              ) : post.mediaType === 'video' ? (
                <video 
                  className={styles.postVideo}
                  controls
                  poster={post.thumbnailUrl}
                >
                  <source src={post.mediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>
          )}

          <div className={styles.actionsContainer}>
            <div className={styles.reactionContainer}>
              <PostReactionButton postId={post.id} />
            </div>
          </div>
        </div>        <div className={styles.commentsSection}>
          <h5 className={styles.commentsSectionTitle}>Bình luận ({post.commentsCount || 0})</h5>
          
          <CommentList 
            postId={post.id} 
            commentsCount={post.commentsCount} 
          />
        </div>
      </Modal.Body>      <Modal.Footer className={styles.modalFooter}>
        {user ? (
          <CommentForm 
            postId={post.id} 
            onCommentAdded={() => {}} 
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
