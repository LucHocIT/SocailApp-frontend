import React, { useState, useEffect } from 'react';
import { useUserBlock } from '../../context/UserBlockContext';
import BlockUserButton from './BlockUserButton';
import styles from './BlockedUsersList.module.scss';

const BlockedUsersList = ({ showAsModal = false, onClose = null }) => {
  const { blockedUsers, loadBlockedUsers, loading } = useUserBlock();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const result = await loadBlockedUsers(1, 10);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const result = await loadBlockedUsers(nextPage, 10);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more blocked users:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUnblockSuccess = () => {
    // Refresh the list after unblocking
    loadInitialData();
  };

  const content = (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Danh sách người đã chặn</h2>
        {showAsModal && (
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className={styles.content}>
        {loading && blockedUsers.length === 0 ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Đang tải...</span>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🚫</div>
            <h3>Không có người dùng nào bị chặn</h3>
            <p>Bạn chưa chặn ai cả.</p>
          </div>
        ) : (
          <>
            <div className={styles.usersList}>
              {blockedUsers.map((user) => (
                <div key={user.id} className={styles.userItem}>
                  <div className={styles.userInfo}>
                    <img
                      src={user.profilePictureUrl || '/default-avatar.png'}
                      alt={`${user.firstName} ${user.lastName}`}
                      className={styles.avatar}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div className={styles.userDetails}>
                      <h4 className={styles.userName}>
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className={styles.userEmail}>@{user.email}</p>
                      {user.reason && (
                        <p className={styles.blockReason}>
                          Lý do: {user.reason}
                        </p>
                      )}
                      <p className={styles.blockDate}>
                        Chặn vào: {new Date(user.blockedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <BlockUserButton
                      userId={user.id}
                      userName={`${user.firstName} ${user.lastName}`}
                      variant="minimal"
                      size="small"
                      onUnblockSuccess={handleUnblockSuccess}
                    />
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMore}>
                <button
                  className={styles.loadMoreButton}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className={styles.spinner}></div>
                      Đang tải...
                    </>
                  ) : (
                    'Tải thêm'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default BlockedUsersList;
