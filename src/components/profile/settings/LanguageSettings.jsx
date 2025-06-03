import { useState } from 'react';
import styles from './SettingsStyles.module.scss';

const LanguageSettings = () => {
  const [settings, setSettings] = useState({
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={styles.settingsContainer}>
      <h3>Ngôn ngữ và khu vực</h3>
      <p>Cài đặt ngôn ngữ hiển thị và múi giờ.</p>
      
      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <span>Ngôn ngữ</span>
          <select 
            className={styles.select}
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <span>Múi giờ</span>
          <select 
            className={styles.select}
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
          >
            <option value="Asia/Ho_Chi_Minh">GMT+7 (Hồ Chí Minh)</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default LanguageSettings;
