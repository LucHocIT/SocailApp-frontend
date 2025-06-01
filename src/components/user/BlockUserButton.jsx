import React, { useState } from 'react';
import { useUserBlock } from '../../context/UserBlockContext';
import { useBlockStatus } from '../../hooks/useBlockStatus';
import styles from './BlockUserButton.module.scss';

const BlockUserButton = ({ 
  userId, 
  userName,
  variant = 'default', // 'default', 'minimal', 'icon-only'
  size = 'medium', // 'small', 'medium', 'large'
  showConfirmDialog = true,
  onBlockSuccess = null,
  onUnblockSuccess = null,
  className = ''
}) => {
  const { blockUser, unblockUser, loading: contextLoading } = useUserBlock();
  const { status, loading: statusLoading } = useBlockStatus(userId);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loading = contextLoading || statusLoading || actionLoading;
  const isBlocked = status.isBlocked;
  const isBlockedBy = status.isBlockedBy;
  const areMutuallyBlocking = status.areMutuallyBlocking;

  const handleBlockClick = () => {
    if (showConfirmDialog) {
      setShowBlockDialog(true);
    } else {
      handleBlock();
    }
  };

  const handleBlock = async () => {
    try {
      setActionLoading(true);
      await blockUser(userId, blockReason.trim() || null);
      setShowBlockDialog(false);
      setBlockReason('');
      onBlockSuccess?.(userId);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Có lỗi xảy ra khi chặn người dùng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (showConfirmDialog && !confirm(`Bạn có chắc chắn muốn bỏ chặn ${userName}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await unblockUser(userId);
      onUnblockSuccess?.(userId);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Có lỗi xảy ra khi bỏ chặn người dùng');
    } finally {
      setActionLoading(false);
    }
  };

  // Don't show button if user is blocked by the other user (but not mutual)
  if (isBlockedBy && !areMutuallyBlocking) {
    return null;
  }

  const buttonText = isBlocked ? 'Bỏ chặn' : 'Chặn';
  const buttonClass = `${styles.blockButton} ${styles[variant]} ${styles[size]} ${isBlocked ? styles.unblock : styles.block} ${className}`;

  return (
    <>
      <button
        className={buttonClass}
        onClick={isBlocked ? handleUnblock : handleBlockClick}
        disabled={loading}
        title={isBlocked ? `Bỏ chặn ${userName}` : `Chặn ${userName}`}
      >
        {loading ? (
          <span className={styles.loading}>
            <span className={styles.spinner}></span>
            {variant !== 'icon-only' && 'Đang xử lý...'}
          </span>
        ) : (
          <>
            {variant === 'icon-only' ? (
              <span className={styles.icon}>
                {isBlocked ? '🔓' : '🚫'}
              </span>
            ) : (
              <>
                <span className={styles.icon}>
                  {isBlocked ? '🔓' : '🚫'}
                </span>
                {buttonText}
              </>
            )}
          </>
        )}
      </button>

      {/* Block Confirmation Dialog */}
      {showBlockDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <h3>Chặn {userName}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowBlockDialog(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.dialogContent}>
              <p>Bạn có chắc chắn muốn chặn {userName}?</p>
              <p className={styles.note}>
                Khi chặn, các bạn sẽ không thể nhắn tin hoặc tương tác với nhau.
              </p>
              
              <div className={styles.reasonGroup}>
                <label htmlFor="blockReason">Lý do chặn (tùy chọn):</label>
                <textarea
                  id="blockReason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Nhập lý do chặn..."
                  maxLength={200}
                  rows={3}
                />
                <span className={styles.charCount}>
                  {blockReason.length}/200
                </span>
              </div>
            </div>
            
            <div className={styles.dialogActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowBlockDialog(false)}
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handleBlock}
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang chặn...' : 'Chặn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlockUserButton;
