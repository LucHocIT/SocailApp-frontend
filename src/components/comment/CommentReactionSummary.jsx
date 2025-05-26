import React, { useState } from 'react';
import { Modal, ListGroup, Image, Badge, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import commentService from '../../services/commentService';
import styles from './styles/CommentReactionSummary.module.scss';

const CommentReactionSummary = ({ commentId, reactionCounts, visible, onHide }) => {
  const [loading, setLoading] = useState(false);
  const [reactionDetails, setReactionDetails] = useState([]);
  const [selectedReactionType, setSelectedReactionType] = useState('all');

  // Get reaction types with counts
  const getReactionTypes = () => {
    if (!reactionCounts || Object.keys(reactionCounts).length === 0) return [];
    
    const types = Object.entries(reactionCounts)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        emoji: commentService.getReactionEmoji(type),
        label: getReactionLabel(type)
      }))
      .sort((a, b) => b.count - a.count);
    
    return types;
  };

  const getReactionLabel = (type) => {
    const labels = {
      like: 'Thích',
      love: 'Yêu thích',
      haha: 'Haha',
      wow: 'Wow',
      sad: 'Buồn',
      angry: 'Tức giận'
    };
    return labels[type] || type;
  };

  // Load detailed reaction data when modal opens
  const handleShow = async () => {
    if (!commentId) return;
    
    try {
      setLoading(true);
      const details = await commentService.getCommentReactions(commentId);
      setReactionDetails(details);
    } catch (error) {
      console.error('Error loading reaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter reactions by type
  const getFilteredReactions = () => {
    if (selectedReactionType === 'all') {
      return reactionDetails;
    }
    return reactionDetails.filter(reaction => reaction.reactionType === selectedReactionType);
  };

  const reactionTypes = getReactionTypes();
  const totalReactions = reactionTypes.reduce((sum, reaction) => sum + reaction.count, 0);

  if (reactionTypes.length === 0) return null;

  return (
    <>
      {/* Summary display - clickable to open modal */}
      <div className={styles.reactionSummary} onClick={handleShow}>
        <div className={styles.reactionEmojis}>
          {reactionTypes.slice(0, 3).map((reaction, index) => (
            <span 
              key={reaction.type} 
              className={styles.reactionEmoji}
              style={{ zIndex: 3 - index }}
            >
              {reaction.emoji}
            </span>
          ))}
        </div>
        <span className={styles.reactionCount}>
          {totalReactions}
        </span>
      </div>

      {/* Detailed modal */}
      <Modal
        show={visible}
        onHide={onHide}
        onShow={handleShow}
        centered
        className={styles.reactionModal}
      >
        <Modal.Header className={styles.modalHeader}>
          <Modal.Title>Cảm xúc</Modal.Title>
          <Button variant="link" onClick={onHide} className={styles.closeButton}>
            <FaTimes />
          </Button>
        </Modal.Header>

        <Modal.Body className={styles.modalBody}>
          {/* Reaction type filters */}
          <div className={styles.reactionFilters}>
            <Button
              variant={selectedReactionType === 'all' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setSelectedReactionType('all')}
              className={styles.filterButton}
            >
              Tất cả {totalReactions}
            </Button>
            {reactionTypes.map(reaction => (
              <Button
                key={reaction.type}
                variant={selectedReactionType === reaction.type ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setSelectedReactionType(reaction.type)}
                className={styles.filterButton}
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>

          {/* Reaction list */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <ListGroup variant="flush" className={styles.reactionList}>
              {getFilteredReactions().map((reaction, index) => (
                <ListGroup.Item key={index} className={styles.reactionItem}>
                  <div className={styles.userInfo}>
                    <Image
                      src={reaction.user?.profilePictureUrl || '/images/default-avatar.png'}
                      roundedCircle
                      className={styles.userAvatar}
                    />
                    <div className={styles.userDetails}>
                      <span className={styles.userName}>
                        {reaction.user?.username || 'Unknown User'}
                        {reaction.user?.isVerified && (
                          <Badge bg="primary" className={styles.verifiedBadge}>✓</Badge>
                        )}
                      </span>
                      <small className={styles.reactionTime}>
                        {new Date(reaction.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <div className={styles.reactionEmoji}>
                    {commentService.getReactionEmoji(reaction.reactionType)}
                  </div>
                </ListGroup.Item>
              ))}
              
              {getFilteredReactions().length === 0 && !loading && (
                <div className={styles.emptyState}>
                  <p>Không có cảm xúc nào để hiển thị.</p>
                </div>
              )}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CommentReactionSummary;
