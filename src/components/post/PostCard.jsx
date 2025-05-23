import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image, Badge, Dropdown } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaComment, FaEllipsisV, FaTrash, FaPencilAlt, FaFile } from 'react-icons/fa';
import { useAuth } from '../../context';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import TimeAgo from 'react-timeago';
import { convertUtcToLocal } from '../../utils/dateUtils';
import styles from './styles/PostCard.module.scss';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);

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
  };

  const isOwner = user && post.userId === user.id;  return (
    <Card className={`${styles.postCard} ${post.isNew ? styles.newPost : ''}`} data-aos="fade-up">
      <Card.Header className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <Link to={`/profile/${post.username}`}>
            <Image
              src={post.profilePictureUrl || '/images/default-avatar.png'}
              alt={post.username}
              className={styles.avatar}
              roundedCircle
            />
          </Link>
          <div>
            <Link to={`/profile/${post.username}`} className={styles.username}>
              {post.username}
            </Link>
            <div className={styles.timeInfo}>
              <TimeAgo date={convertUtcToLocal(post.createdAt)} title={new Date(post.createdAt).toLocaleString()} />
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <Badge bg="light" text="dark" className="ms-2 fst-italic">đã chỉnh sửa</Badge>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className={styles.menuButton}>
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => {
                  if (onPostUpdated) onPostUpdated(post);
                }}
              >
                <FaPencilAlt className="me-2" /> Chỉnh sửa
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={handleDelete}
                className="text-danger"
              >
                <FaTrash className="me-2" /> Xóa
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </Card.Header>      <Card.Body className={styles.cardBody}>
        <Card.Text className={styles.postContent}>{post.content}</Card.Text>
        {post.mediaUrl && (
          <div className={styles.mediaContainer}>
            {post.mediaType === 'image' ? (
              <Image 
                src={post.mediaUrl} 
                alt="Post media" 
                className={styles.image}
                fluid 
              />
            ) : post.mediaType === 'video' ? (
              <video 
                className={styles.video}
                controls
              >
                <source src={post.mediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            ) : post.mediaType === 'file' ? (
              <div className="p-3">
                <a 
                  href={post.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.file}
                >
                  <FaFile className={styles.fileIcon} /> {post.mediaFilename}
                </a>
              </div>
            ) : null}
          </div>
        )}
      </Card.Body>      <Card.Footer className={styles.cardFooter}>
        <div className={styles.actionButtons}>
          <Button 
            variant="link" 
            className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            {isLiked ? <FaHeart className={styles.actionIcon} /> : <FaRegHeart className={styles.actionIcon} />}
            <span className={styles.actionCount}>{likesCount}</span>
          </Button>

          <Link to={`/post/${post.id}`} className={styles.actionButton}>
            <FaComment className={styles.actionIcon} />
            <span className={styles.actionCount}>{post.commentsCount}</span>
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default PostCard;
