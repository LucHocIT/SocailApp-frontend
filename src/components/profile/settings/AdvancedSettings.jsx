import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import styles from './SettingsStyles.module.scss';

const AdvancedSettings = () => {
  const [settings, setSettings] = useState({
    developerMode: false,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      // TODO: Implement account deletion
      alert('Tính năng xóa tài khoản sẽ được phát triển trong tương lai');
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h3>Cài đặt nâng cao</h3>
      <p>Các tùy chọn nâng cao cho người dùng có kinh nghiệm.</p>
      
      <div className={styles.settingGroup}>
        <label className={styles.settingLabel}>
          <input 
            type="checkbox" 
            checked={settings.developerMode}
            onChange={(e) => handleSettingChange('developerMode', e.target.checked)}
          />
          <span>Chế độ nhà phát triển</span>
        </label>
      </div>

      <div className={styles.dangerZone}>
        <h4>Vùng nguy hiểm</h4>
        <button 
          className={styles.btnDanger}
          onClick={handleDeleteAccount}
        >
          <FaTrash /> Xóa tài khoản
        </button>
        <small>Hành động này không thể hoàn tác</small>
      </div>
    </div>
  );
};

export default AdvancedSettings;
