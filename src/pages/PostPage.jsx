import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PostCard from '../components/post/PostCard';
import postService from '../services/postService';

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

  if (loading) {
    return (
      <Container className="post-page-container">
        <div className="loading-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="post-page-container">
        <div className="error-container">
          <p>{error}</p>
          <Button variant="primary" as={Link} to="/">
            Trở về Trang chủ
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="post-page-container">
      <div className="header">
        <Button 
          variant="link"
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          <FaArrowLeft /> Quay lại
        </Button>
      </div>

      <div className="post-container">
        {post && (
          <PostCard 
            post={post} 
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        )}
      </div>
    </Container>
  );
};

export default PostPage;
