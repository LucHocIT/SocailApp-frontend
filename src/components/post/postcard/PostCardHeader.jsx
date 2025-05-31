// PostCard Header Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Image, Badge, Dropdown, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaEllipsisV, FaTrash, FaPencilAlt, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import TimeAgo from 'react-timeago';
import { parseDate } from '../../../utils/dateUtils';
import styles from '../styles/postcard/PostCard.module.scss';

const PostCardHeader = ({ 
  post, 
  user, 
  isBookmarked, 
  onBookmark, 
  onEdit, 
  onDelete 
}) => {
  const isOwner = user && post.userId === user.id;

  return (
    <Card.Header className={styles.cardHeader}>
      <div className={styles.userInfo}>
        <Link to={`/profile/${post.username}`} className={styles.avatarLink}>          <Image
            src={post.profilePictureUrl || '/images/default-avatar.png'}
            alt={post.username}
            className={styles.avatar}
            roundedCircle={true}
          />
          {user && post.isVerified && (
            <span className={styles.verifiedBadge} title="Tài khoản đã xác minh">✓</span>
          )}
        </Link>
        <div>          <div className={styles.userHeader}>
            <Link to={`/profile/${post.username}`} className={styles.username}>
              {post.firstName && post.lastName ? `${post.firstName} ${post.lastName}` : post.username}
            </Link>
            {post.category && (
              <Badge bg="primary" pill className={styles.categoryBadge}>
                {post.category}
              </Badge>
            )}
          </div>
          <div className={styles.timeInfo}>
            <TimeAgo date={parseDate(post.createdAt)} title={new Date(post.createdAt).toLocaleString()} />
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <Badge bg="light" text="dark" className={`ms-2 fst-italic ${styles.editedBadge}`}>đã chỉnh sửa</Badge>
            )}
          </div>
        </div>
      </div>
      <div className={styles.postActions}>
        {/* Nút bookmark */}          
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}</Tooltip>}
        >
          <Button 
            variant="link" 
            className={styles.bookmarkButton}
            onClick={onBookmark}
          >
            {isBookmarked ? 
              <FaBookmark className={styles.bookmarkIcon} /> : 
              <FaRegBookmark className={styles.bookmarkIcon} />
            }
          </Button>
        </OverlayTrigger>

        {isOwner && (
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className={styles.menuButton}>
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu className={styles.dropdownMenu}>
              <Dropdown.Item onClick={() => onEdit && onEdit(post)}>
                <FaPencilAlt className="me-2" /> Chỉnh sửa
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={onDelete}
                className="text-danger"
              >
                <FaTrash className="me-2" /> Xóa
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </Card.Header>
  );
};

export default PostCardHeader;
