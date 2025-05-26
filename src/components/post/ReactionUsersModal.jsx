import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tab, Nav, Image, Spinner, Badge, Button } from 'react-bootstrap';
import postService from '../../services/postService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactionUsersSkeleton from './ReactionUsersSkeleton';
import '../../styles/ReactionUsersModal.css';

const ReactionUsersModal = ({ show, onHide, postId }) => {  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [followStatus, setFollowStatus] = useState({});
  const [processingFollow, setProcessingFollow] = useState({});
  const usersPerPage = 10;  // Sử dụng useMemo để tránh tạo lại mảng mỗi lần render
  const reactionTypes = useMemo(() => ['all', 'love', 'like', 'haha', 'wow', 'sad', 'angry'], []);
    // Get users for current tab
  const filteredUsers = useMemo(() => {
    return reactions[activeTab] || [];
  }, [reactions, activeTab]);
  
  // Get paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage, usersPerPage]);    useEffect(() => {
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
        
        // Cập nhật trạng thái theo dõi cho mỗi người dùng
        const followStatusMap = {};
        response.users.forEach(user => {
          followStatusMap[user.id] = user.isFollowing || false;
        });
        setFollowStatus(followStatusMap);
        
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
    return paginatedUsers;
  };
  
  // Total number of pages for pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / usersPerPage);
  }, [filteredUsers, usersPerPage]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  
  // Handle follow/unfollow users
  const handleFollowToggle = async (userId) => {
    try {
      setProcessingFollow(prev => ({ ...prev, [userId]: true }));
      
      const isCurrentlyFollowing = followStatus[userId];
      const userService = await import('../../services/userService').then(m => m.default);
      
      if (isCurrentlyFollowing) {
        await userService.unfollowUser(userId);
        setFollowStatus(prev => ({ ...prev, [userId]: false }));
        toast.success('Đã bỏ theo dõi người dùng');
      } else {
        await userService.followUser(userId);
        setFollowStatus(prev => ({ ...prev, [userId]: true }));
        toast.success('Đã bắt đầu theo dõi người dùng');
      }
    } catch (err) {
      toast.error('Không thể thực hiện thao tác. Vui lòng thử lại sau.');
      console.error('Error toggling follow status:', err);
    } finally {
      setProcessingFollow(prev => ({ ...prev, [userId]: false }));
    }
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
      size="md"
    >      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title className="fw-bold">
          <div>Người thả reaction</div>
        </Modal.Title>
      </Modal.Header>
        <Tab.Container activeKey={activeTab} onSelect={handleTabSelect} id="reactions-tabs">
        <Nav variant="pills" className="reaction-tabs flex-nowrap px-2 mb-2" style={{ overflowX: 'auto' }}>
          {reactionTypes.map(type => (
            <Nav.Item key={type} className="mx-1">
              <Nav.Link 
                eventKey={type} 
                className={`d-flex align-items-center rounded-pill ${reactions[type]?.length === 0 ? 'disabled-tab' : ''}`}
                disabled={reactions[type]?.length === 0}
              >
                {getTabTitle(type)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Modal.Body className="pt-0">
          <Tab.Content>
            <Tab.Pane eventKey={activeTab}>              {loading ? (
                <div className="p-2">
                  <ReactionUsersSkeleton count={5} />
                </div>
              ) : error ? (
                <div className="text-center p-4 text-danger">
                  <p>{error}</p>
                </div>              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  <p>Không có reaction nào</p>
                </div>
              ) : (
                <>                  <div className="reaction-users-list">
                    {getReactionUsers().map((user, index) => (
                        <div
                          key={user.id}
                          className="reaction-user-item rounded hover-effect mb-2"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >                          <div className="d-flex align-items-center text-decoration-none p-2">
                            <Link to={`/profile/${user.username}`} className="d-flex align-items-center text-decoration-none">
                              <Image 
                                src={user.profilePictureUrl || '/images/default-avatar.png'} 
                                roundedCircle 
                                className="reaction-user-avatar"
                                width={48}
                                height={48}
                                style={{ objectFit: 'cover', border: '2px solid var(--bs-primary)' }}
                              />
                              <div className="ms-3">
                                <div className="d-flex align-items-center">
                                  <span className="reaction-user-name fw-bold">{user.username}</span>
                                  {user.isVerified && (
                                    <Badge bg="primary" className="ms-1">✓</Badge>
                                  )}
                                  {user.isOnline && (
                                    <span className="ms-2 online-indicator"></span>
                                  )}
                                </div>
                                <div className="small text-muted">{user.fullName || user.username}</div>
                              </div>
                            </Link>
                            <div className="ms-auto d-flex align-items-center">
                              {activeTab === 'all' && (
                                <div className="reaction-type-badge p-2 me-2">
                                  {getReactionEmoji(user.reactionType)}
                                </div>
                              )}
                              {user.id !== JSON.parse(localStorage.getItem('user') || '{}').id && (
                                <Button 
                                  size="sm"
                                  variant={followStatus[user.id] ? "outline-secondary" : "primary"}
                                  className="rounded-pill px-3"
                                  disabled={processingFollow[user.id]}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFollowToggle(user.id);
                                  }}
                                >
                                  {processingFollow[user.id] ? (
                                    <Spinner 
                                      as="span" 
                                      animation="border" 
                                      size="sm" 
                                      role="status" 
                                      aria-hidden="true" 
                                    />
                                  ) : followStatus[user.id] ? 'Đang theo dõi' : 'Theo dõi'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                    {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex flex-column align-items-center mt-3">
                      <ul className="pagination pagination-sm">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                            &laquo;
                          </button>
                        </li>
                        {totalPages <= 5 ? (
                          // Show all page numbers if 5 or fewer pages
                          Array.from({ length: totalPages }, (_, i) => (
                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                                {i + 1}
                              </button>
                            </li>
                          ))
                        ) : (
                          // Show limited page numbers for many pages
                          <>
                            <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                            </li>
                            
                            {currentPage > 3 && (
                              <li className="page-item disabled">
                                <button className="page-link">...</button>
                              </li>
                            )}
                            
                            {/* Pages around current page */}
                            {Array.from(
                              { length: Math.min(3, totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (currentPage <= 2) pageNum = i + 2;
                                else if (currentPage >= totalPages - 1) pageNum = totalPages - 3 + i;
                                else pageNum = currentPage - 1 + i;
                                
                                if (pageNum > 1 && pageNum < totalPages) {
                                  return (
                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                      <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                        {pageNum}
                                      </button>
                                    </li>
                                  );
                                }
                                return null;
                              }
                            ).filter(Boolean)}
                            
                            {currentPage < totalPages - 2 && (
                              <li className="page-item disabled">
                                <button className="page-link">...</button>
                              </li>
                            )}
                            
                            <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                                {totalPages}
                              </button>
                            </li>
                          </>
                        )}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                            &raquo;
                          </button>
                        </li>
                      </ul>
                      
                      {filteredUsers.length > usersPerPage * 2 && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="mt-2 text-decoration-none"
                          onClick={() => onHide()}
                        >
                          Xem tất cả {filteredUsers.length} người dùng trong trang đầy đủ
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Modal.Body>
      </Tab.Container>
    </Modal>
  );
};

export default ReactionUsersModal;
