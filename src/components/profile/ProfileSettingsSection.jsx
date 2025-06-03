import { useState } from 'react';
import { 
  FaUser, FaLock, FaEye, FaBan, FaBell, 
  FaGlobe, FaShieldAlt, FaCog
} from 'react-icons/fa';
import { 
  ProfileSettings, 
  PrivacySettings, 
  SecuritySettings, 
  BlockingSettings, 
  NotificationSettings, 
  LanguageSettings, 
  AdvancedSettings 
} from './settings';
import styles from './ProfileSettings.module.scss';

const ProfileSettingsSection = ({ profileData, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: FaUser },
    { id: 'privacy', label: 'Quyền riêng tư', icon: FaEye },
    { id: 'security', label: 'Bảo mật', icon: FaLock },
    { id: 'blocking', label: 'Chặn người dùng', icon: FaBan },
    { id: 'notifications', label: 'Thông báo', icon: FaBell },
    { id: 'language', label: 'Ngôn ngữ', icon: FaGlobe },
    { id: 'advanced', label: 'Nâng cao', icon: FaShieldAlt },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'security':
        return <SecuritySettings />;
      case 'blocking':
        return <BlockingSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className={styles.settingsOverlay}>
      <div className={styles.settingsModal}>
        <div className={styles.settingsHeader}>
          <div className={styles.headerLeft}>
            <FaCog className={styles.settingsIcon} />
            <h2>Cài đặt</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.settingsContent}>
          <div className={styles.settingsSidebar}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {profileData?.profilePictureUrl ? (
                  <img src={profileData.profilePictureUrl} alt="Avatar" />
                ) : (
                  <span>{profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}</span>
                )}
              </div>
              <div className={styles.userDetails}>
                <h3>{profileData?.firstName} {profileData?.lastName}</h3>
                <p>@{profileData?.username}</p>
              </div>
            </div>            <nav className={styles.settingsNav}>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className={styles.navIcon} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={styles.settingsMainContent}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsSection;
