import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image, Badge, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaComment, FaEllipsisV, FaTrash, FaPencilAlt, FaFile, 
  FaShareAlt, FaBookmark, FaRegBookmark, FaEye } from 'react-icons/fa';
import { useAuth } from '../../context/hooks';
import { toast } from 'react-toastify';
import postService from '../../services/postService';
import TimeAgo from 'react-timeago';
import { convertUtcToLocal } from '../../utils/dateUtils';
import styles from './styles/PostCard.module.scss';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarkedByCurrentUser || false);
  const [viewsCount, setViewsCount] = useState(post.viewsCount || Math.floor(Math.random() * 50) + 5); // Placeholder
  // Add reaction state
  const [currentReaction, setCurrentReaction] = useState(post.currentUserReactionType || null);
  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {});
  // Updated to handle reactions instead of simple likes
  const handleReaction = async (reactionType = 'like') => {
    try {
      if (!user) {
        toast.error('Bạn cần đăng nhập để bày tỏ cảm xúc!');
        return;
      }

      // If same reaction is clicked again, remove it
      const shouldRemove = currentReaction === reactionType;
      
      // If removing or changing reaction
      if (currentReaction) {
        // Update reaction counts by decrementing old reaction type
        setReactionCounts(prev => {
          const updated = {...prev};
          if (updated[currentReaction] && updated[currentReaction] > 0) {
            updated[currentReaction]--;
            if (updated[currentReaction] === 0) {
              delete updated[currentReaction];
            }
          }
          return updated;
        });
      }
      
      // If adding new reaction (not removing)
      if (!shouldRemove) {
        // Update reaction counts by incrementing new reaction type
        setReactionCounts(prev => {
          const updated = {...prev};
          updated[reactionType] = (updated[reactionType] || 0) + 1;
          return updated;
        });
      }
      
      // Update like state for backward compatibility
      const isLikeAction = reactionType === 'like';
      if (shouldRemove) {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - (currentReaction === 'like' ? 1 : 0)));
        setCurrentReaction(null);
      } else {
        setIsLiked(isLikeAction);
        // Increment likes count only if changing from non-like to like
        if (isLikeAction && currentReaction !== 'like') {
          setLikesCount(prev => prev + 1);
        } else if (!isLikeAction && currentReaction === 'like') {
          // Decrement likes count if changing from like to another reaction
          setLikesCount(prev => Math.max(0, prev - 1));
        }
        setCurrentReaction(reactionType);
      }
      
      // Call API to update reaction
      await postService.addReaction({
        postId: post.id,
        reactionType: shouldRemove ? null : reactionType
      });
      
      // Show feedback
      if (!shouldRemove) {
        const reactionMessages = {
          like: 'Bạn đã thích bài viết!',
          love: 'Bạn đã yêu thích bài viết!',
          haha: 'Bạn thấy bài viết hài hước!',
          wow: 'Bạn ngạc nhiên về bài viết!',
          sad: 'Bạn buồn về bài viết này!',
          angry: 'Bài viết khiến bạn tức giận!'
        };
        toast.success(reactionMessages[reactionType] || 'Đã bày tỏ cảm xúc!');
      } else {
        toast.info('Đã xóa cảm xúc!');
      }
    } catch (error) {
      console.error('Failed to handle reaction:', error);
      toast.error('Không thể bày tỏ cảm xúc. Vui lòng thử lại sau.');
    }
  };
  
  // For backward compatibility with old like system
  const handleLike = () => handleReaction('like');

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
    // Giả lập xử lý bookmark - sẽ tích hợp API thực sau
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Đã xóa bài viết khỏi bookmark' : 'Đã thêm bài viết vào bookmark');
  };
  
  const handleShare = () => {
    // Tạo URL để share bài viết
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    
    // Nếu có Web Share API thì dùng nó
    if (navigator.share) {
      navigator.share({
        title: `Bài đăng từ ${post.username}`,
        text: post.content.slice(0, 100) + '...',
        url: shareUrl,
      })
      .then(() => toast.info('Đã chia sẻ bài viết'))
      .catch(error => console.log('Error sharing', error));
    } else {
      // Nếu không có Web Share API thì copy URL
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.info('Đã copy đường dẫn bài viết vào clipboard'))
        .catch(error => console.error('Could not copy text: ', error));
    }
    
    // Tăng số lượt chia sẻ (giả lập)
    setViewsCount(prevCount => prevCount + 1);
  };
    const isOwner = user && post.userId === user.id;const showContentToggle = post.content.length > 280;
  const [expanded, setExpanded] = useState(false);
  
  // Xử lý double tap để like
  const cardRef = useRef(null);
  const [lastTap, setLastTap] = useState(0);
  
  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked && user) {
        handleLike();
        
        // Hiệu ứng hình trái tim
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
  
  // Theo dõi lượt xem
  useEffect(() => {
    // Chỉ tính lượt xem khi bài post hiển thị trong viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Giả lập tăng view - trong thực tế sẽ gọi API
          setViewsCount(prev => prev + 1);
          // Ngừng theo dõi sau khi đã tính 1 lượt xem
          observer.disconnect();
        }
      },
      { threshold: 0.5 } // Tính khi hiển thị ít nhất 50% của bài post
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <Card className={`${styles.postCard} ${post.isNew ? styles.newPost : ''}`} data-aos="fade-up" ref={cardRef} onTouchStart={handleDoubleTap} style={{ position: 'relative' }}>
      <Card.Header className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <Link to={`/profile/${post.username}`} className={styles.avatarLink}>
            <Image
              src={post.profilePictureUrl || '/images/default-avatar.png'}
              alt={post.username}
              className={styles.avatar}
              roundedCircle
            />
            {user && post.isVerified && (
              <span className={styles.verifiedBadge} title="Tài khoản đã xác minh">✓</span>
            )}
          </Link>
          <div>
            <div className={styles.userHeader}>
              <Link to={`/profile/${post.username}`} className={styles.username}>
                {post.username}
              </Link>
              {post.category && (
                <Badge bg="primary" pill className={styles.categoryBadge}>
                  {post.category}
                </Badge>
              )}
            </div>
            <div className={styles.timeInfo}>
              <TimeAgo date={convertUtcToLocal(post.createdAt)} title={new Date(post.createdAt).toLocaleString()} />
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <Badge bg="light" text="dark" className={`ms-2 fst-italic ${styles.editedBadge}`}>đã chỉnh sửa</Badge>
              )}
            </div>
          </div>
        </div>
        <div className={styles.postActions}>
          {/* Nút bookmark */}          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}</Tooltip>}
          >
            <Button 
              variant="link" 
              className={styles.bookmarkButton}
              onClick={handleBookmark}
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
        </div>
      </Card.Header>

      <Card.Body className={styles.cardBody}>
        <Card.Text className={styles.postContent}>
          {showContentToggle ? (
            <>
              {expanded ? post.content : `${post.content.slice(0, 280)}...`}
              <Button 
                variant="link" 
                className={styles.readMoreButton}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Thu gọn' : 'Xem thêm'}
              </Button>
            </>
          ) : post.content}
        </Card.Text>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className={styles.hashtagContainer}>
            {post.hashtags.map((tag, index) => (
              <Badge key={index} bg="light" text="primary" className={styles.hashtag}>
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        {post.mediaUrl && (
          <div className={`${styles.mediaContainer} ${post.mediaType === 'image' ? styles.imageContainer : ''}`}>            {post.mediaType === 'image' ? (
              <div className={styles.imageWrapper}>
                <Image 
                  src={post.mediaUrl} 
                  alt="Post media" 
                  className={styles.image}
                  loading="lazy"
                  fluid 
                />
                <div className={styles.imageOverlay}>
                  <div className={styles.imageActions}>
                    <div 
                      className={styles.imageAction} 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(post.mediaUrl, '_blank');
                      }}
                      title="Xem ảnh đầy đủ"
                    >
                      <FaEye />
                    </div>
                  </div>
                </div>
              </div>
            ) : post.mediaType === 'video' ?(
              <div className={styles.videoWrapper}>
                <video 
                  className={styles.video}
                  controls
                  poster={post.thumbnailUrl}
                >
                  <source src={post.mediaUrl} type={post.mediaMimeType || 'video/mp4'} />
                  Your browser does not support the video tag.
                </video>
                <div className={styles.videoDuration}>{post.duration || '00:00'}</div>
              </div>
            ) : post.mediaType === 'file' ? (
              <div className={styles.fileContainer}>
                <a 
                  href={post.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.file}
                >
                  <FaFile className={styles.fileIcon} /> 
                  <span>{post.mediaFilename}</span>
                  <Badge bg="light" text="dark" className={styles.fileSize}>
                    {post.mediaFileSize || '0 KB'}
                  </Badge>
                </a>
              </div>
            ) : null}
          </div>
        )}
      </Card.Body>      <Card.Footer className={styles.cardFooter}>
        <div className={styles.reactionSummaryRow}>
          {Object.keys(reactionCounts).length > 0 && (
            <div className={styles.reactionBadges}>
              {/* Display top reaction emojis */}
              {Object.entries(reactionCounts)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 3)
                .map(([type], index) => (
                  <span 
                    key={type} 
                    className={styles.reactionBadge}
                    style={{ 
                      zIndex: 3 - index, 
                      marginLeft: index > 0 ? '-8px' : '0',
                      backgroundColor: `var(${postService.getReactionColor(type)})`
                    }}
                  >
                    {postService.getReactionEmoji(type)}
                  </span>
                ))
              }
              <span className={styles.totalReactionCount}>{likesCount}</span>
            </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <div className={styles.reactionButtonWrapper}>
            <Button 
              variant="link" 
              className={`${styles.actionButton} ${currentReaction ? styles.reacted : ''}`}
              onClick={handleLike}
              onMouseOver={() => document.getElementById(`reactionOptions-${post.id}`).classList.add(styles.showReactions)}
              onMouseLeave={() => document.getElementById(`reactionOptions-${post.id}`).classList.remove(styles.showReactions)}
            >
              {currentReaction ? 
                <>
                  {postService.getReactionEmoji(currentReaction)}
                  <span className={styles.actionLabel}>
                    {currentReaction.charAt(0).toUpperCase() + currentReaction.slice(1)}
                  </span>
                </>
                : 
                <>
                  <FaRegHeart className={styles.actionIcon} />
                  <span className={styles.actionLabel}>Thích</span>
                </>
              }
            </Button>
            
            {/* Reaction options */}
            <div 
              id={`reactionOptions-${post.id}`}
              className={styles.reactionOptions}
              onMouseOver={() => document.getElementById(`reactionOptions-${post.id}`).classList.add(styles.showReactions)}
              onMouseLeave={() => document.getElementById(`reactionOptions-${post.id}`).classList.remove(styles.showReactions)}
            >
              {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map((type) => (
                <Button 
                  key={type}
                  variant="link"
                  className={`${styles.reactionOption} ${currentReaction === type ? styles.activeReaction : ''}`}
                  onClick={() => handleReaction(type)}
                >
                  <span className={styles.reactionEmoji}>{postService.getReactionEmoji(type)}</span>
                  <span className={styles.reactionLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <Link to={`/post/${post.id}`} className={styles.actionButton}>
            <FaComment className={styles.actionIcon} />
            <span className={styles.actionCount}>{post.commentsCount}</span>
          </Link>
            <Button 
            variant="link" 
            className={styles.actionButton}
            onClick={handleShare}
          >
            <FaShareAlt className={styles.actionIcon} />
            <span className={styles.actionLabel}>Chia sẻ</span>
          </Button>
          
          <div className={styles.viewCount}>
            <FaEye className={styles.viewIcon} />
            <span>{viewsCount || 0}</span>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default PostCard;
