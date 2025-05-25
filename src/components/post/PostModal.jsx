import React, { useState } from 'react';
import { Modal, Button, Image, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaRegPaperPlane } from 'react-icons/fa';
import TimeAgo from 'react-timeago';
import { useAuth } from '../../context/hooks';
import { toast } from 'react-toastify';
import { convertUtcToLocal } from '../../utils/dateUtils';
import PostReactionButton from './PostReactionButton';
import styles from './styles/PostModal.module.scss';

const PostModal = ({ show, onHide, post }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [loading] = useState(false);

  // Xử lý đăng bình luận
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    // Placeholder: Sẽ tích hợp API để đăng bình luận sau
    toast.info('Chức năng đăng bình luận sẽ được triển khai sau');
    setCommentText('');
  };  return (
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
        </div>

        <div className={styles.commentsSection}>
          <h5 className={styles.commentsSectionTitle}>Bình luận ({post.commentsCount || 0})</h5>
          
          {post.commentsCount === 0 ? (
            <div className={styles.emptyComments}>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : loading ? (
            <div className={styles.loadingComments}>
              <Spinner animation="border" variant="primary" size="sm" />
              <span>Đang tải bình luận...</span>
            </div>
          ) : (
            <div className={styles.commentsList}>
              {/* Sẽ tích hợp danh sách bình luận sau */}
              <div className={styles.commentPlaceholder}>
                <p>Chức năng hiển thị bình luận sẽ được triển khai sau.</p>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        {user ? (
          <Form onSubmit={handleSubmitComment} className={styles.commentForm}>
            <Image
              src={user?.profilePictureUrl || '/images/default-avatar.png'}
              roundedCircle
              className={styles.commentAvatar}
            />
            <Form.Control
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className={styles.commentInput}
            />
            <Button 
              variant="primary"
              type="submit"
              className={styles.commentSubmit}
              disabled={!commentText.trim() || loading}
            >
              <FaRegPaperPlane />
            </Button>
          </Form>
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
