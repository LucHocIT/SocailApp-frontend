import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tab, Image, Badge } from 'react-bootstrap';
import { FaHeart, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import postService from '../../../services/postService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from '../styles/ReactionUsersModal.module.scss';

const ReactionUsersModal = ({ show, onHide, postId }) => {
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

  // Sử dụng useMemo để tránh tạo lại mảng mỗi lần render
  const reactionTypes = useMemo(() => ['all', 'love', 'like', 'haha', 'wow', 'sad', 'angry'], []);
  
  // Get users for current tab
  const filteredUsers = useMemo(() => {
    return reactions[activeTab] || [];
  }, [reactions, activeTab]);

  useEffect(() => {
    const fetchReactionUsers = async () => {
      if (!postId || !show) return;
      
      try {
        setLoading(true);
        
        // Sử dụng endpoint history để lấy danh sách người dùng đã thả reaction
        const response = await postService.getReactionUsers(postId);
        
        if (!response.users || response.users.length === 0) {
          setReactions({ all: [] });
          setLoading(false);
          return;
        }
        
        // Nhóm người dùng theo loại reaction
        const reactionData = {
          all: response.users
        };
        
        // Phân loại từng loại reaction
        reactionTypes.forEach(type => {
          if (type !== 'all') {
            reactionData[type] = response.users.filter(user => 
              user.reactionType === type
            ) || [];
          }
        });
        
        setReactions(reactionData);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu reactions:', err);
        setError('Không thể tải dữ liệu người dùng');
        toast.error('Không thể tải dữ liệu người dùng đã thả reaction');
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchReactionUsers();
    }
  }, [postId, show, reactionTypes]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };
  const getReactionEmoji = (type) => {
    return postService.getReactionEmoji(type);
  };
  // Function to get unique reaction types with counts for stacked display
  const getStackedReactions = () => {
    const uniqueReactions = [];
    const seenTypes = new Set();
    
    reactionTypes.forEach(type => {
      if (type !== 'all' && reactions[type]?.length > 0 && !seenTypes.has(type)) {
        seenTypes.add(type);
        uniqueReactions.push({
          type,
          emoji: getReactionEmoji(type),
          count: reactions[type].length
        });
      }
    });
    return uniqueReactions.slice(0, 5); // Show max 5 unique reactions in stack
  };
  const getTabTitle = (type) => {
    if (type === 'all') {
      return (
        <div className={styles.tabContent}>
          <span>Tất cả</span>
          <div className={styles.allTabInfo}>
            {/* Stacked Reactions Display next to count */}
            {getStackedReactions().length > 0 && (
              <div className={styles.reactionStack}>
                {getStackedReactions().map((reaction, index) => (
                  <div 
                    key={reaction.type}
                    className={styles.stackedReaction}
                    style={{ 
                      zIndex: getStackedReactions().length - index,
                      transform: `translateX(${index * -6}px)`
                    }}
                    title={`${reaction.count} ${reaction.type} reactions`}
                  >
                    {reaction.emoji}
                  </div>
                ))}
              </div>
            )}
            <span className={styles.reactionCount}>{reactions.all?.length || 0}</span>
          </div>
        </div>
      );
    }
    
    const count = reactions[type]?.length || 0;
    return (
      <div className={styles.tabContent}>
        <span className={styles.reactionEmoji}>{getReactionEmoji(type)}</span>
        <span className={styles.reactionCount}>{count}</span>
      </div>
    );
  };

  const handleRetry = () => {
    setError(null);
    if (show && postId) {
      // Trigger useEffect by changing a dependency
      setLoading(true);
    }
  };
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      dialogClassName={`${styles.modalDialog} reaction-users-modal`}
      contentClassName={`${styles.modalContent} reaction-users-content`}
      size="md"
    >      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <FaHeart className={styles.titleIcon} />
          <span>Reactions</span>
        </Modal.Title>
      </Modal.Header>

      <Tab.Container activeKey={activeTab} onSelect={handleTabSelect} id="reactions-tabs">
        <div className={styles.reactionTabs}>
          {reactionTypes.map(type => (
            <button
              key={type}
              className={`${styles.reactionTab} ${activeTab === type ? styles.active : ''}`}
              disabled={reactions[type]?.length === 0}
              onClick={() => handleTabSelect(type)}
            >
              {getTabTitle(type)}
            </button>
          ))}
        </div>

        <Modal.Body className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.loadingSpinner} />
              <span className={styles.loadingText}>Đang tải danh sách người dùng...</span>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <FaExclamationTriangle className={styles.errorIcon} />
              <h4 className={styles.errorTitle}>Có lỗi xảy ra</h4>
              <p className={styles.errorMessage}>{error}</p>
              <button className={styles.retryButton} onClick={handleRetry}>
                Thử lại
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <FaHeart className={styles.emptyIcon} />
              <h4 className={styles.emptyTitle}>Không có reaction nào</h4>
              <p className={styles.emptyMessage}>
                {activeTab === 'all' 
                  ? 'Chưa có ai thả reaction cho bài viết này' 
                  : `Chưa có ai thả reaction ${getReactionEmoji(activeTab)}`
                }
              </p>
            </div>
          ) : (
            <div className={styles.usersList}>
              {filteredUsers.map((user) => (
                <div key={user.id} className={styles.userItem}>
                  <Link to={`/profile/${user.username}`} className={styles.userLink} onClick={onHide}>
                    <Image 
                      src={user.profilePictureUrl || '/images/default-avatar.png'} 
                      className={styles.userAvatar}
                      alt={user.username}
                    />
                    <div className={styles.userInfo}>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.username}</span>
                        {user.isVerified && (
                          <Badge className={styles.verifiedBadge}>✓</Badge>
                        )}
                        {user.isOnline && (
                          <span className={styles.onlineIndicator}></span>
                        )}
                      </div>
                      <div className={styles.userFullName}>{user.fullName || user.username}</div>
                    </div>
                    
                    {activeTab === 'all' && (
                      <div className={styles.reactionInfo}>
                        <span className={styles.reactionEmoji}>
                          {getReactionEmoji(user.reactionType)}
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Tab.Container>
    </Modal>
  );
};

export default ReactionUsersModal;
