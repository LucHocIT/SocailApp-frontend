import React from 'react';
import { useBlockStatus } from '../../hooks/useBlockStatus';
import styles from './BlockStatusIndicator.module.scss';

const BlockStatusIndicator = ({ 
  userId, 
  variant = 'default', // 'default', 'minimal', 'badge'
  showText = true,
  className = ''
}) => {
  const { status, loading } = useBlockStatus(userId);

  if (loading) {
    return (
      <div className={`${styles.indicator} ${styles.loading} ${className}`}>
        <div className={styles.spinner}></div>
        {showText && <span>Kiểm tra...</span>}
      </div>
    );
  }

  if (!status.isBlocked && !status.isBlockedBy && !status.areMutuallyBlocking) {
    return null; // Don't show anything if there's no block
  }

  let statusInfo = {};

  if (status.areMutuallyBlocking) {
    statusInfo = {
      type: 'mutual',
      icon: '🚫',
      text: 'Chặn lẫn nhau',
      description: 'Cả hai đều đã chặn nhau'
    };
  } else if (status.isBlocked) {
    statusInfo = {
      type: 'blocked',
      icon: '🚫',
      text: 'Đã chặn',
      description: 'Bạn đã chặn người này'
    };
  } else if (status.isBlockedBy) {
    statusInfo = {
      type: 'blocked-by',
      icon: '⛔',
      text: 'Bị chặn',
      description: 'Người này đã chặn bạn'
    };
  }

  const indicatorClass = `${styles.indicator} ${styles[variant]} ${styles[statusInfo.type]} ${className}`;

  return (
    <div className={indicatorClass} title={statusInfo.description}>
      <span className={styles.icon}>{statusInfo.icon}</span>
      {showText && <span className={styles.text}>{statusInfo.text}</span>}
    </div>
  );
};

export default BlockStatusIndicator;
