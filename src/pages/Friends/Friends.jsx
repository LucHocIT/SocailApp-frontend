import { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Nav } from 'react-bootstrap';
import { FaUserFriends, FaUserPlus, FaUsers, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useProfile, useAuth } from '../../context/hooks';
import UserSearch from '../../components/user/UserSearch';
import UserList from '../../components/profile/UserList';
import styles from './Friends.module.scss';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const { getFollowers, getFollowing } = useProfile();

  useEffect(() => {
    const fetchFriendsData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const [followersData, followingData] = await Promise.all([
          getFollowers(user.id),
          getFollowing(user.id)
        ]);
        
        setFollowers(followersData || []);
        setFollowing(followingData || []);
        
        // Create friends list (mutual follows)
        const followersIds = new Set((followersData || []).map(f => f.id));
        const mutualFriends = (followingData || []).filter(u => followersIds.has(u.id));
        setFriends(mutualFriends);
        
      } catch (error) {
        console.error('Error fetching friends data:', error);
        setError(error.message || 'Không thể tải danh sách bạn bè');
        toast.error(error.message || 'Có lỗi xảy ra khi tải danh sách bạn bè');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsData();
  }, [user, getFollowers, getFollowing]);

  if (loading) {
    return (
      <Container className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải danh sách bạn bè...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Thử lại
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className={styles.friendsContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <FaUserFriends className={styles.titleIcon} />
          Bạn bè
        </h1>
        <p className={styles.pageSubtitle}>
          Quản lý và kết nối với bạn bè của bạn
        </p>
      </div>

      <Row>
        <Col lg={3} md={4} className={styles.sidebar}>
          <div className={styles.searchSection}>
            <h4 className={styles.sectionTitle}>
              <FaSearch /> Tìm kiếm người dùng
            </h4>
            <UserSearch />
          </div>
          
          <div className={styles.statsCard}>
            <h4>Thống kê</h4>
            <div className={styles.statItem}>
              <FaUserFriends />
              <span>Bạn bè: {friends.length}</span>
            </div>
            <div className={styles.statItem}>
              <FaUsers />
              <span>Người theo dõi: {followers.length}</span>
            </div>
            <div className={styles.statItem}>
              <FaUserPlus />
              <span>Đang theo dõi: {following.length}</span>
            </div>
          </div>
        </Col>
        
        <Col lg={9} md={8}>
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className={styles.friendsTabs}>
              <Nav.Item>
                <Nav.Link eventKey="friends" className={styles.tabLink}>
                  <FaUserFriends /> Bạn bè ({friends.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="followers" className={styles.tabLink}>
                  <FaUsers /> Người theo dõi ({followers.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="following" className={styles.tabLink}>
                  <FaUserPlus /> Đang theo dõi ({following.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content className={styles.tabContent}>
              <Tab.Pane eventKey="friends">
                <div className={styles.friendsSection}>
                  <h3 className={styles.sectionHeader}>
                    Bạn bè của bạn
                  </h3>
                  {friends.length === 0 ? (
                    <div className={styles.emptyState}>
                      <FaUserFriends className={styles.emptyIcon} />
                      <h4>Chưa có bạn bè nào</h4>
                      <p>Bạn bè là những người mà bạn theo dõi và họ cũng theo dõi lại bạn.</p>
                      <p>Hãy kết nối với mọi người để mở rộng mạng lưới bạn bè!</p>
                    </div>                  ) : (
                    <UserList 
                      users={friends}
                      emptyMessage="Chưa có bạn bè nào."
                    />
                  )}
                </div>
              </Tab.Pane>
              
              <Tab.Pane eventKey="followers">
                <div className={styles.followersSection}>
                  <h3 className={styles.sectionHeader}>
                    Người theo dõi bạn
                  </h3>
                  {followers.length === 0 ? (
                    <div className={styles.emptyState}>
                      <FaUsers className={styles.emptyIcon} />
                      <h4>Chưa có người theo dõi nào</h4>
                      <p>Hãy chia sẻ những nội dung thú vị để thu hút người theo dõi!</p>
                    </div>
                  ) : (
                    <UserList 
                      users={followers}
                      emptyMessage="Chưa có người theo dõi nào."
                    />
                  )}
                </div>
              </Tab.Pane>
              
              <Tab.Pane eventKey="following">
                <div className={styles.followingSection}>
                  <h3 className={styles.sectionHeader}>
                    Bạn đang theo dõi
                  </h3>
                  {following.length === 0 ? (
                    <div className={styles.emptyState}>
                      <FaUserPlus className={styles.emptyIcon} />
                      <h4>Bạn chưa theo dõi ai</h4>
                      <p>Tìm kiếm và theo dõi những người bạn quan tâm để xem nội dung của họ!</p>
                    </div>
                  ) : (
                    <UserList 
                      users={following}
                      emptyMessage="Bạn chưa theo dõi ai."
                    />
                  )}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Friends;
