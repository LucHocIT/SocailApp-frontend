import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PostCard from '../components/post/PostCard';
import postService from '../services/postService';
import styles from './PostPage.module.scss';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await postService.getPost(postId);
        setPost(postData);
        setError(null);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Không thể tải bài viết. Bài viết này có thể không tồn tại hoặc đã bị xóa.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handlePostUpdated = (updatedPost) => {
    setPost(updatedPost);
    toast.success('Bài viết đã được cập nhật thành công!');
  };

  const handlePostDeleted = () => {
    toast.success('Bài viết đã được xóa thành công!');
    navigate('/');
  };

  return (
    <Container className={styles.postPageContainer}>
      <div className={styles.header}>
        <Button 
          variant="outline-secondary" 
          className={styles.backButton} 
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Quay lại
        </Button>
        <h1>Chi tiết bài viết</h1>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <Button variant="primary" as={Link} to="/">
            Trở về Trang chủ
          </Button>
        </div>
      ) : (
        <div className={styles.postContainer}>
          {post && (
            <PostCard 
              post={post} 
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          )}
        </div>
      )}
    </Container>
  );
};

export default PostPage;
