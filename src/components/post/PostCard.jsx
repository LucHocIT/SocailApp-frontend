import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image, Badge } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaComment, FaEllipsisV, FaTrash, FaPencilAlt, FaFile } from 'react-icons/fa';
import { useAuth } from '../../context';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import TimeAgo from 'react-timeago';
import styles from './Post.module.scss';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    try {
      if (!user) {
        toast.error('Bạn cần đăng nhập để thích bài viết!');
        return;
      }

      await postService.toggleLike(post.id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Không thể thích bài viết. Vui lòng thử lại sau.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        await postService.deletePost(post.id);
        toast.success('Bài viết đã được xóa thành công!');
        if (onPostDeleted) onPostDeleted(post.id);
      } catch (error) {
        console.error('Failed to delete post:', error);
        toast.error('Không thể xóa bài viết. Vui lòng thử lại sau.');
      }
    }
    setShowMenu(false);
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  const isOwner = user && post.userId === user.id;

  return (
    <Card className={styles.postCard} data-aos="fade-up">
      <Card.Header className={styles.postHeader}>
        <div className={styles.userInfo}>
          <Image 
            src={post.profilePictureUrl || '/images/default-avatar.png'} 
            className={styles.avatar} 
            roundedCircle
          />
          <div>
            <Link to={`/profile/${post.username}`} className={styles.username}>
              {post.username}
            </Link>
            <div className={styles.postTime}>
              <TimeAgo date={post.createdAt} />
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <span className={styles.editedLabel}> (đã chỉnh sửa)</span>
              )}
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className={styles.menuContainer}>
            <Button variant="link" onClick={toggleMenu} className={styles.menuButton}>
              <FaEllipsisV />
            </Button>
            {showMenu && (
              <div className={styles.menuDropdown}>
                <Button 
                  variant="link" 
                  className={styles.menuItem} 
                  onClick={() => {
                    setShowMenu(false);
                    if (onPostUpdated) onPostUpdated(post);
                  }}
                >
                  <FaPencilAlt /> Chỉnh sửa
                </Button>
                <Button 
                  variant="link" 
                  className={styles.menuItem} 
                  onClick={handleDelete}
                >
                  <FaTrash /> Xóa
                </Button>
              </div>
            )}
          </div>
        )}
      </Card.Header>      <Card.Body>
        <Card.Text className={styles.postContent}>{post.content}</Card.Text>
        {post.mediaUrl && (
          <div className={`${styles.mediaContainer} ${styles[post.mediaType]}`}>
            {post.mediaType === 'image' ? (
              <Image 
                src={post.mediaUrl} 
                alt="Post media" 
                className={styles.postMedia}
                fluid 
              />
            ) : post.mediaType === 'video' ? (
              <video 
                controls 
                className={styles.postMedia}
                preload="metadata"
              >
                <source src={post.mediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            ) : post.mediaType === 'file' ? (
              <div className={styles.fileContainer}>
                <a 
                  href={post.mediaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.fileDownload}
                >
                  <FaFile /> Tải xuống tập tin
                </a>
              </div>
            ) : null}
          </div>
        )}
      </Card.Body>

      <Card.Footer className={styles.postFooter}>
        <div className={styles.postStats}>
          <Button 
            variant="link" 
            className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`} 
            onClick={handleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{likesCount}</span>
          </Button>

          <Link to={`/post/${post.id}`} className={styles.actionButton}>
            <FaComment />
            <span>{post.commentsCount}</span>
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default PostCard;
