import { useState } from 'react';
import styles from './SettingsStyles.module.scss';

const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    privateAccount: false,
    allowStrangerMessages: true,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={styles.settingsContainer}>
      <h3>Cài đặt quyền riêng tư</h3>
      <p>Kiểm soát ai có thể xem và tương tác với nội dung của bạn.</p>
      
      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.privateAccount}
            onChange={(e) => handleSettingChange('privateAccount', e.target.checked)}
          />
          <span>Tài khoản riêng tư</span>
        </label>
        <small className={styles.settingDescription}>
          Chỉ những người theo dõi mới có thể xem bài viết của bạn
        </small>
      </div>

      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.allowStrangerMessages}
            onChange={(e) => handleSettingChange('allowStrangerMessages', e.target.checked)}
          />
          <span>Cho phép tin nhắn từ người lạ</span>
        </label>
      </div>
    </div>
  );
};

export default PrivacySettings;
