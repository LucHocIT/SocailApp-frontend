import { useState } from 'react';
import styles from './SettingsStyles.module.scss';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={styles.settingsContainer}>
      <h3>Cài đặt thông báo</h3>
      <p>Chọn loại thông báo bạn muốn nhận.</p>
      
      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
          />
          <span>Thông báo qua email</span>
        </label>
      </div>

      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.pushNotifications}
            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
          />
          <span>Thông báo push</span>
        </label>
      </div>

      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.messageNotifications}
            onChange={(e) => handleSettingChange('messageNotifications', e.target.checked)}
          />
          <span>Thông báo tin nhắn mới</span>
        </label>
      </div>
    </div>
  );
};

export default NotificationSettings;
