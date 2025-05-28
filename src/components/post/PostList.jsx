import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Alert, Card } from 'react-bootstrap';
import { FaSync } from 'react-icons/fa';
import PostCard from './postcard/PostCard';
import EditPostModal from './EditPostModal';
import postService from '../../services/postService';

const PostList = ({ username, onlyFollowing }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const loadPosts = useCallback(async (currentPage = 1) => {
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
  }, [username, onlyFollowing]);

  useEffect(() => {
    // Reset states when filters change
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadPosts(1);
  }, [username, onlyFollowing, loadPosts]);
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

  if (error) {    return <Alert variant="danger">{error}</Alert>;
  }  return (
    <div className="w-100" style={{ maxWidth: '700px', margin: '0 auto' }}>
      {posts.length === 0 && !loading ? (
        <Alert variant="info" className="text-center py-4">Không có bài viết nào để hiển thị.</Alert>
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
            <div className="text-center my-4">
              <Button
                variant="outline-primary"
                onClick={handleLoadMore}
                disabled={loading}
                className="rounded-pill px-4"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Đang tải...</span>
                  </>
                ) : 'Tải thêm bài viết'}
              </Button>
            </div>
          )}          {loading && page === 1 && (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Đang tải bài viết...</span>
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
