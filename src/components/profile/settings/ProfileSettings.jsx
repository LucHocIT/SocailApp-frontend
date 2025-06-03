import { useState } from 'react';
import styles from './SettingsStyles.module.scss';

const ProfileSettings = () => {
  const [settings, setSettings] = useState({
    showEmailPublicly: false,
    allowPhoneSearch: false,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={styles.settingsContainer}>
      <h3>Cài đặt hồ sơ</h3>
      <p>Quản lý thông tin cá nhân và hiển thị công khai.</p>
      
      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.showEmailPublicly}
            onChange={(e) => handleSettingChange('showEmailPublicly', e.target.checked)}
          />
          <span>Hiển thị email công khai</span>
        </label>
      </div>

      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.allowPhoneSearch}
            onChange={(e) => handleSettingChange('allowPhoneSearch', e.target.checked)}
          />
          <span>Cho phép tìm kiếm bằng số điện thoại</span>
        </label>
      </div>
    </div>
  );
};

export default ProfileSettings;
