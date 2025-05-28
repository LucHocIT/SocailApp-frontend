import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaComment, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PostCard from '../components/post/postcard/PostCard';
import postService from '../services/postService';
import styles from './PostPage.module.scss';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await postService.getPost(postId);
        setPost(postData);
        
        // Sau khi lấy bài viết thành công, lấy các bài viết liên quan
        if (postData) {
          try {
            const related = await postService.getPosts({
              username: postData.username,
              pageSize: 3,
              excludePostId: postData.id
            });
            setRelatedPosts(related.posts || []);
          } catch (err) {
            console.log("Không thể lấy bài viết liên quan", err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Không thể tải bài viết. Bài viết này có thể không tồn tại hoặc đã bị xóa.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    
    // Cuộn trang lên đầu khi vào trang chi tiết bài viết
    window.scrollTo(0, 0);
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
      <div className={styles.pageWrapper}>
        <Container className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.pulseLoader}></div>
            <p>Đang tải bài viết...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <Container className={styles.container}>
          <div className={styles.errorContainer}>
            <Alert variant="danger">{error}</Alert>
            <Button variant="primary" as={Link} to="/" className={styles.returnButton}>
              Trở về Trang chủ
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Container className={styles.container}>
        <div className={styles.header}>
          <Button 
            variant="link"
            onClick={() => navigate(-1)} 
            className={styles.backButton}
          >
            <FaArrowLeft /> Quay lại
          </Button>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.postContainer} data-aos="fade-up">
            {post && (
              <PostCard 
                post={post} 
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
              />
            )}
          </div>

          {relatedPosts.length > 0 && (
            <div className={styles.relatedPosts}>
              <h3 className={styles.sectionTitle} data-aos="fade-up">
                <FaHeart className={styles.sectionIcon} /> Bài viết khác từ {post.username}
              </h3>
              <div className={styles.relatedPostsList}>
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className={styles.relatedPostCard} data-aos="fade-up">
                    <Link to={`/post/${relatedPost.id}`} className={styles.relatedPostLink}>
                      <h4>{relatedPost.content.length > 60 
                        ? `${relatedPost.content.substring(0, 60)}...`
                        : relatedPost.content}
                      </h4>
                      <div className={styles.postMeta}>
                        <span>
                          <FaHeart /> {relatedPost.likesCount}
                        </span>
                        <span>
                          <FaComment /> {relatedPost.commentsCount}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default PostPage;
