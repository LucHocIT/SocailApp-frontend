import { useState } from 'react';
import { 
  FaUser, FaLock, FaEye, FaBan, FaBell, 
  FaGlobe, FaShieldAlt, FaTrash 
} from 'react-icons/fa';
import { useAuth } from '../context/hooks';
import BlockedUsersList from '../components/user/BlockedUsersList';
import styles from './SettingsPage.module.scss';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

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
        return (
          <div className={styles.tabContent}>
            <h3>Cài đặt hồ sơ</h3>
            <p>Quản lý thông tin cá nhân và hiển thị công khai.</p>
            <div className={styles.settingGroup}>
              <label>Hiển thị email công khai</label>
              <input type="checkbox" />
            </div>
            <div className={styles.settingGroup}>
              <label>Cho phép tìm kiếm bằng số điện thoại</label>
              <input type="checkbox" />
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className={styles.tabContent}>
            <h3>Cài đặt quyền riêng tư</h3>
            <p>Kiểm soát ai có thể xem và tương tác với nội dung của bạn.</p>
            <div className={styles.settingGroup}>
              <label>Tài khoản riêng tư</label>
              <input type="checkbox" />
              <small>Chỉ những người theo dõi mới có thể xem bài viết của bạn</small>
            </div>
            <div className={styles.settingGroup}>
              <label>Cho phép tin nhắn từ người lạ</label>
              <input type="checkbox" />
            </div>
          </div>
        );
      case 'security':
        return (
          <div className={styles.tabContent}>
            <h3>Bảo mật tài khoản</h3>
            <p>Tăng cường bảo mật cho tài khoản của bạn.</p>
            <div className={styles.settingGroup}>
              <label>Xác thực hai yếu tố</label>
              <button className={styles.btnSecondary}>Kích hoạt</button>
            </div>
            <div className={styles.settingGroup}>
              <label>Phiên đăng nhập</label>
              <button className={styles.btnSecondary}>Xem tất cả phiên</button>
            </div>
          </div>
        );
      case 'blocking':
        return (
          <div className={styles.tabContent}>
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
          </div>
        );
      case 'notifications':
        return (
          <div className={styles.tabContent}>
            <h3>Cài đặt thông báo</h3>
            <p>Chọn loại thông báo bạn muốn nhận.</p>
            <div className={styles.settingGroup}>
              <label>Thông báo qua email</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.settingGroup}>
              <label>Thông báo push</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.settingGroup}>
              <label>Thông báo tin nhắn mới</label>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        );
      case 'language':
        return (
          <div className={styles.tabContent}>
            <h3>Ngôn ngữ và khu vực</h3>
            <p>Cài đặt ngôn ngữ hiển thị và múi giờ.</p>
            <div className={styles.settingGroup}>
              <label>Ngôn ngữ</label>
              <select className={styles.select}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className={styles.settingGroup}>
              <label>Múi giờ</label>
              <select className={styles.select}>
                <option value="Asia/Ho_Chi_Minh">GMT+7 (Hồ Chí Minh)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        );
      case 'advanced':
        return (
          <div className={styles.tabContent}>
            <h3>Cài đặt nâng cao</h3>
            <p>Các tùy chọn nâng cao cho người dùng có kinh nghiệm.</p>
            <div className={styles.settingGroup}>
              <label>Chế độ nhà phát triển</label>
              <input type="checkbox" />
            </div>
            <div className={styles.dangerZone}>
              <h4>Vùng nguy hiểm</h4>
              <button className={styles.btnDanger}>
                <FaTrash /> Xóa tài khoản
              </button>
              <small>Hành động này không thể hoàn tác</small>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Bạn cần đăng nhập để truy cập trang này</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.settingsPage}>
        <div className={styles.header}>
          <h1>Cài đặt</h1>
          <p>Quản lý tài khoản và tùy chọn của bạn</p>
        </div>

        <div className={styles.settingsContent}>
          <div className={styles.sidebar}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Avatar" />
                ) : (
                  <span>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
                )}
              </div>
              <div className={styles.userDetails}>
                <h3>{user.firstName} {user.lastName}</h3>
                <p>@{user.username}</p>
              </div>
            </div>

            <nav className={styles.nav}>
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

          <div className={styles.mainContent}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {showBlockedUsers && (
        <BlockedUsersList onClose={() => setShowBlockedUsers(false)} />
      )}
    </div>
  );
};

export default SettingsPage;
