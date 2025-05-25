import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Nav, Tab, Spinner, Badge, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import commentService from '../../services/commentService';
import { toast } from 'react-toastify';
import styles from './styles/CommentReactionUsersModal.module.scss';

const CommentReactionUsersModal = ({ show, onHide, commentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reactions, setReactions] = useState({
    all: [],
    like: [],
    love: [],
    haha: [],
    wow: [],
    sad: [],
    angry: []
  });
  const [activeTab, setActiveTab] = useState('all');
  
  const reactionTypes = ['all', 'like', 'love', 'haha', 'wow', 'sad', 'angry'];
  
  const loadReactionUsers = useCallback(async () => {
    if (!commentId) return;
    
    setLoading(true);
    try {
      const data = await commentService.getCommentReactionUsers(commentId);
      
      // Group users by reaction type
      const groupedReactions = {
        all: data,
        like: data.filter(user => user.reactionType === 'like'),
        love: data.filter(user => user.reactionType === 'love'),
        haha: data.filter(user => user.reactionType === 'haha'),
        wow: data.filter(user => user.reactionType === 'wow'),
        sad: data.filter(user => user.reactionType === 'sad'),
        angry: data.filter(user => user.reactionType === 'angry')
      };
      
      setReactions(groupedReactions);
      setError(null);
    } catch (err) {
      console.error('Error loading reaction users:', err);
      setError('Failed to load users who reacted');
      toast.error('Failed to load reaction users');
    } finally {
      setLoading(false);
    }
  }, [commentId]);
  
  useEffect(() => {
    if (show && commentId) {
      loadReactionUsers();
    }
  }, [show, commentId, loadReactionUsers]);
  
  const handleTabSelect = (key) => {
    setActiveTab(key);
  };
  
  const getReactionEmoji = (type) => {
    const emojis = {
      like: '👍',
      love: '❤️',
      haha: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😠'
    };
    return emojis[type] || '';
  };
  
  const getTabTitle = (type) => {
    if (type === 'all') {
      return (
        <>
          Tất cả <span className={styles.reactionCount}>({reactions.all.length})</span>
        </>
      );
    } else {
      return (
        <>
          {getReactionEmoji(type)} <span className={styles.reactionCount}>({reactions[type]?.length || 0})</span>
        </>
      );
    }
  };
  
  const getReactionUsers = () => {
    return reactions[activeTab] || [];
  };
  
  return (
    <Modal show={show} onHide={onHide} centered className={styles.modal}>
      <Modal.Header closeButton>
        <Modal.Title className={styles.modalTitle}>Người đã thả reaction</Modal.Title>
      </Modal.Header>
      
      <Tab.Container activeKey={activeTab} onSelect={handleTabSelect} id="reactions-tabs">
        <Nav variant="tabs" className={styles.reactionTabs}>
          {reactionTypes.map(type => (
            <Nav.Item key={type}>
              <Nav.Link 
                eventKey={type} 
                className={reactions[type]?.length === 0 ? styles.disabledTab : ''}
                disabled={reactions[type]?.length === 0}
              >
                {getTabTitle(type)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Modal.Body>
          <Tab.Content>
            <Tab.Pane eventKey={activeTab}>
              {loading ? (
                <div className={styles.loading}>
                  <Spinner animation="border" variant="primary" />
                  <p>Đang tải...</p>
                </div>
              ) : error ? (
                <div className={styles.error}>
                  <p>{error}</p>
                </div>
              ) : getReactionUsers().length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Không có reaction nào</p>
                </div>
              ) : (
                <div className={styles.usersList}>
                  {getReactionUsers().map(user => (
                    <div key={user.id} className={styles.userItem}>
                      <Link to={`/profile/${user.username}`} className="d-flex align-items-center text-decoration-none">
                        <Image 
                          src={user.profilePictureUrl || '/images/default-avatar.png'} 
                          className={styles.userAvatar}
                        />
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>
                            {user.username}
                            {user.isVerified && (
                              <Badge bg="primary" className="ms-1" style={{ fontSize: '0.6rem' }}>✓</Badge>
                            )}
                          </div>
                          {activeTab === 'all' && (
                            <div className={styles.reactionType}>
                              {getReactionEmoji(user.reactionType)}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Modal.Body>
      </Tab.Container>
    </Modal>
  );
};

// Export both as named export and default export for compatibility
export { CommentReactionUsersModal };
export default CommentReactionUsersModal;
