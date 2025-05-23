import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image, Badge, Dropdown } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaComment, FaEllipsisV, FaTrash, FaPencilAlt, FaFile } from 'react-icons/fa';
import { useAuth } from '../../context';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import TimeAgo from 'react-timeago';
import { convertUtcToLocal } from '../../utils/dateUtils';

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

  const isOwner = user && post.userId === user.id;

  return (
    <Card className="mb-4 shadow-sm border-0 rounded-3" data-aos="fade-up">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
        <div className="d-flex align-items-center gap-3">
          <Link to={`/profile/${post.username}`}>
            <Image
              src={post.profilePictureUrl || '/images/default-avatar.png'}
              alt={post.username}
              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
              className="border border-2 border-primary-subtle"
              roundedCircle
            />
          </Link>
          <div>
            <Link to={`/profile/${post.username}`} className="text-decoration-none fw-semibold text-body d-block mb-1">
              {post.username}
            </Link>
            <div className="text-muted small d-flex align-items-center gap-1">
              <TimeAgo date={convertUtcToLocal(post.createdAt)} title={new Date(post.createdAt).toLocaleString()} />
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <Badge bg="light" text="dark" className="ms-2 fst-italic">đã chỉnh sửa</Badge>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="text-secondary p-0 border-0">
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
      </Card.Header>
      <Card.Body>
        <Card.Text className="white-space-pre-line mb-3">{post.content}</Card.Text>
        {post.mediaUrl && (
          <div className="rounded overflow-hidden bg-light">
            {post.mediaType === 'image' ? (
              <Image 
                src={post.mediaUrl} 
                alt="Post media" 
                className="w-100"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
                fluid 
              />
            ) : post.mediaType === 'video' ? (
              <video 
                className="w-100"
                style={{ maxHeight: '500px' }}
                controls
              >
                <source src={post.mediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            ) : post.mediaType === 'file' ? (
              <div className="p-3 bg-light">
                <a 
                  href={post.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-flex align-items-center gap-2 text-decoration-none text-primary p-2 rounded hover-bg-primary-subtle"
                >
                  <FaFile /> {post.mediaFilename}
                </a>
              </div>
            ) : null}
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-white border-top">
        <div className="d-flex gap-4">
          <Button 
            variant="link" 
            className={`d-flex align-items-center gap-2 text-decoration-none p-2 ${isLiked ? 'text-danger' : 'text-body'}`}
            onClick={handleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{likesCount}</span>
          </Button>

          <Link to={`/post/${post.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-body p-2">
            <FaComment />
            <span>{post.commentsCount}</span>
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default PostCard;
