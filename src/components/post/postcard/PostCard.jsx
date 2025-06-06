import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useAuth } from '../../../context/hooks';
import { toast } from 'react-toastify';
import postService from '../../../services/postService';
import styles from '../styles/postcard/PostCard.module.scss';
import PostCardHeader from './PostCardHeader';
import PostCardBody from './PostCardBody';
import PostCardFooter from './PostCardFooter';
import { ReactionUsersModal } from '../reactions';
import PostModal from '../PostModal';

const PostCard = ({ post, onPostUpdated, onPostDeleted, focusCommentId }) => {  
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarkedByCurrentUser || false);
  const [viewsCount, setViewsCount] = useState(post.viewsCount || Math.floor(Math.random() * 50) + 5);
  const [showReactionUsersModal, setShowReactionUsersModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Handle double tap
  const cardRef = useRef(null);
  const [lastTap, setLastTap] = useState(0);
  
  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (user) {
        const heart = document.createElement('div');
        heart.className = styles.doubleTapHeart;
        heart.innerHTML = '❤️';
        
        const rect = cardRef.current.getBoundingClientRect();
        heart.style.left = `${e.clientX - rect.left}px`;
        heart.style.top = `${e.clientY - rect.top}px`;
        
        cardRef.current.appendChild(heart);
        
        setTimeout(() => {
          heart.remove();
        }, 1000);
      }
    }
    setLastTap(now);
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

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Đã xóa bài viết khỏi bookmark' : 'Đã thêm bài viết vào bookmark');
  };
  
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Bài đăng từ ${post.username}`,
        text: post.content.slice(0, 100) + '...',
        url: shareUrl,
      })
      .then(() => toast.info('Đã chia sẻ bài viết'))
      .catch(error => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.info('Đã copy đường dẫn bài viết vào clipboard'))
        .catch(error => console.error('Could not copy text: ', error));
    }
    
    setViewsCount(prevCount => prevCount + 1);
  };
  
  // Theo dõi lượt xem
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setViewsCount(prev => prev + 1);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
    return (
    <>      <Card 
        className={`${styles.postCard} ${post.isNew ? styles.newPost : ''} ${(post.privacyLevel > 0 || post.PrivacyLevel > 0) ? styles.privatePost : ''}`} 
        data-aos="fade-up" 
        ref={cardRef} 
        onTouchStart={handleDoubleTap}
        style={{ position: 'relative' }}
      >
        <PostCardHeader
          post={post}
          user={user}
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
          onEdit={onPostUpdated}
          onDelete={handleDelete}
        />

        <PostCardBody post={post} />

        <PostCardFooter
          post={post}
          viewsCount={viewsCount}
          onShare={handleShare}
          onShowComments={() => setShowPostModal(true)}
          onShowReactionUsers={() => setShowReactionUsersModal(true)}
        />
      </Card>

      <ReactionUsersModal 
        show={showReactionUsersModal} 
        onHide={() => setShowReactionUsersModal(false)} 
        postId={post.id}
      />
        <PostModal
        show={showPostModal}
        onHide={() => setShowPostModal(false)}
        post={post}
        focusCommentId={focusCommentId}
      />
    </>
  );
};

export default PostCard;
