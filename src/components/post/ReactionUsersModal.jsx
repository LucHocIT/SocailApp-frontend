import React, { useState, useEffect } from 'react';
import { Modal, Tab, Nav, Image, Spinner, Badge } from 'react-bootstrap';
import postService from '../../services/postService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ReactionUsersModal = ({ show, onHide, postId }) => {  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  // Sử dụng useMemo để tránh tạo lại mảng mỗi lần render
  const reactionTypes = React.useMemo(() => ['all', 'love', 'like', 'haha', 'wow', 'sad', 'angry'], []);
    useEffect(() => {
    const fetchReactionUsers = async () => {
      if (!postId || !show) return;
      
      try {
        setLoading(true);
        
        // Sử dụng endpoint history để lấy danh sách người dùng đã thả reaction
        const response = await postService.getReactionUsers(postId);
        
        if (!response.users || response.users.length === 0) {
          setReactions({ all: [] });
          setLoading(false);
          return;
        }
        
        // Nhóm người dùng theo loại reaction
        const reactionData = {
          all: response.users
        };
        
        // Phân loại từng loại reaction
        reactionTypes.forEach(type => {
          if (type !== 'all') {
            reactionData[type] = response.users.filter(user => 
              user.reactionType === type
            ) || [];
          }
        });
        
        setReactions(reactionData);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu reactions:', err);
        setError('Không thể tải dữ liệu người dùng');
        toast.error('Không thể tải dữ liệu người dùng đã thả reaction');
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchReactionUsers();
    }
  }, [postId, show, reactionTypes]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  const getReactionUsers = () => {
    return reactions[activeTab] || [];
  };

  const getReactionEmoji = (type) => {
    return postService.getReactionEmoji(type);
  };

  const getTabTitle = (type) => {
    if (type === 'all') {
      return `Tất cả (${reactions.all?.length || 0})`;
    }
    
    const count = reactions[type]?.length || 0;
    return (
      <>
        {getReactionEmoji(type)} {count}
      </>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      className="reaction-users-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Người thả reaction</Modal.Title>
      </Modal.Header>
      
      <Tab.Container activeKey={activeTab} onSelect={handleTabSelect} id="reactions-tabs">
        <Nav variant="tabs" className="reaction-tabs">
          {reactionTypes.map(type => (
            <Nav.Item key={type}>
              <Nav.Link 
                eventKey={type} 
                className={`d-flex align-items-center ${reactions[type]?.length === 0 ? 'disabled-tab' : ''}`}
                disabled={reactions[type]?.length === 0}
              >
                {getTabTitle(type)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Modal.Body>
          <Tab.Content>
            <Tab.Pane eventKey={activeTab}>
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Đang tải...</p>
                </div>
              ) : error ? (
                <div className="text-center p-4 text-danger">
                  <p>{error}</p>
                </div>
              ) : getReactionUsers().length === 0 ? (
                <div className="text-center p-4 text-muted">
                  <p>Không có reaction nào</p>
                </div>
              ) : (
                <div className="reaction-users-list">
                  {getReactionUsers().map(user => (
                    <div key={user.id} className="reaction-user-item d-flex align-items-center p-2">
                      <Link to={`/profile/${user.username}`} className="d-flex align-items-center text-decoration-none">
                        <Image 
                          src={user.profilePictureUrl || '/images/default-avatar.png'} 
                          roundedCircle 
                          className="reaction-user-avatar"
                          width={40}
                          height={40}
                        />
                        <div className="ms-2">
                          <div className="d-flex align-items-center">
                            <span className="reaction-user-name">{user.username}</span>
                            {user.isVerified && (
                              <Badge bg="primary" className="ms-1" style={{ fontSize: '0.6rem' }}>✓</Badge>
                            )}
                          </div>
                          {activeTab === 'all' && (
                            <div className="reaction-type-badge">
                              {getReactionEmoji(user.reactionType)}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Modal.Body>
      </Tab.Container>
    </Modal>
  );
};

export default ReactionUsersModal;
