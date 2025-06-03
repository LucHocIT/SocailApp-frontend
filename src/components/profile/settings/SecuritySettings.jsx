import styles from './SettingsStyles.module.scss';

const SecuritySettings = () => {
  const handleEnable2FA = () => {
    // TODO: Implement 2FA activation
    alert('Tính năng xác thực hai yếu tố sẽ được phát triển trong tương lai');
  };

  const handleViewSessions = () => {
    // TODO: Implement session management
    alert('Tính năng quản lý phiên đăng nhập sẽ được phát triển trong tương lai');
  };

  return (
    <div className={styles.settingsContainer}>
      <h3>Bảo mật tài khoản</h3>
      <p>Tăng cường bảo mật cho tài khoản của bạn.</p>
      
      <div className={styles.settingGroup}>
        <div className={styles.settingRow}>
          <div>
            <label>Xác thực hai yếu tố</label>
            <small>Thêm lớp bảo vệ bổ sung cho tài khoản của bạn</small>
          </div>
          <button 
            className={styles.btnSecondary}
            onClick={handleEnable2FA}
          >
            Kích hoạt
          </button>
        </div>
      </div>

      <div className={styles.settingGroup}>
        <div className={styles.settingRow}>
          <div>
            <label>Phiên đăng nhập</label>
            <small>Xem và quản lý các thiết bị đã đăng nhập</small>
          </div>
          <button 
            className={styles.btnSecondary}
            onClick={handleViewSessions}
          >
            Xem tất cả phiên
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
