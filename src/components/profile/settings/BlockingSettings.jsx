import { useState } from 'react';
import { FaBan } from 'react-icons/fa';
import BlockedUsersList from '../../user/BlockedUsersList';
import styles from './SettingsStyles.module.scss';

const BlockingSettings = () => {
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  return (
    <div className={styles.settingsContainer}>
      <h3>Quản lý người dùng bị chặn</h3>
      <p>Xem và quản lý danh sách những người dùng bạn đã chặn.</p>
      
      <div className={styles.settingGroup}>
        <button 
          className={styles.btnPrimary}
          onClick={() => setShowBlockedUsers(true)}
        >
          <FaBan /> Xem danh sách người dùng bị chặn
        </button>
      </div>

      <div className={styles.infoBox}>
        <h4>Về tính năng chặn người dùng:</h4>
        <ul>
          <li>Người bị chặn không thể xem hồ sơ của bạn</li>
          <li>Họ không thể gửi tin nhắn cho bạn</li>
          <li>Các bài viết của họ sẽ bị ẩn khỏi bảng tin của bạn</li>
          <li>Bạn có thể bỏ chặn bất kỳ lúc nào</li>
        </ul>
      </div>

      {showBlockedUsers && (
        <BlockedUsersList onClose={() => setShowBlockedUsers(false)} />
      )}
    </div>
  );
};

export default BlockingSettings;
