import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PostCard from './PostCard';
import EditPostModal from './EditPostModal';
import postService from '../../services/postService';
import styles from './Post.module.scss';

const PostList = ({ username, onlyFollowing }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const loadPosts = async (currentPage = 1) => {
    try {
      setLoading(true);
      
      const filters = {
        pageNumber: currentPage,
        pageSize: 10
      };
      
      if (username) {
        filters.username = username;
      }
      
      if (onlyFollowing !== undefined) {
        filters.onlyFollowing = onlyFollowing;
      }

      const result = await postService.getPosts(filters);
      
      if (currentPage === 1) {
        setPosts(result.posts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...result.posts]);
      }
      
      setHasMore(currentPage < result.totalPages);
      setPage(currentPage);
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset states when filters change
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadPosts(1);
  }, [username, onlyFollowing]);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostUpdated = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleSaveEdit = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  };

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.postList}>
      {posts.length === 0 && !loading ? (
        <div className={styles.noPostsMessage}>Không có bài viết nào để hiển thị.</div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostUpdated={handlePostUpdated} 
              onPostDeleted={handlePostDeleted} 
            />
          ))}

          {hasMore && (
            <div className="text-center mt-3 mb-4">
              <Button
                variant="outline-primary"
                onClick={handleLoadMore}
                disabled={loading}
                className={styles.loadMoreButton}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Đang tải...</span>
                  </>
                ) : 'Tải thêm bài viết'}
              </Button>
            </div>
          )}

          {loading && page === 1 && (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
            </div>
          )}
        </>
      )}

      <EditPostModal 
        show={showEditModal} 
        post={editingPost}
        onHide={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default PostList;
