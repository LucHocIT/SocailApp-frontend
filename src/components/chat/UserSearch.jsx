import React, { useState, useEffect } from 'react';
import { Card, Form, ListGroup, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import './UserSearch.scss';

const UserSearch = ({ onUserSelect, onClose, alwaysVisible = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);  useEffect(() => {
    const searchFriends = async () => {
      try {
        setLoading(true);
        setHasSearched(true);
        
        // Tìm kiếm chỉ những người dùng là bạn bè cho chat
        const response = await userService.searchFriends(searchTerm.trim());
        setSearchResults(response.users || response || []);
      } catch (error) {
        console.error('Error searching friends:', error);
        toast.error('Không thể tìm kiếm bạn bè');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Optimized debounce timing for always-visible mode
    const debounceTime = alwaysVisible ? 300 : 500;
    
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchFriends();
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, debounceTime);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, alwaysVisible]);const handleUserSelect = (user) => {
    onUserSelect(user);
  };  return (
    <Card className={`user-search-card ${alwaysVisible ? 'always-visible' : ''}`}>
      {!alwaysVisible && (
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Tìm kiếm bạn bè</h6>
          <Button variant="link" size="sm" onClick={onClose} className="p-0">
            <i className="bi bi-x-lg"></i>
          </Button>
        </Card.Header>
      )}
      
      <Card.Body className={alwaysVisible ? "p-2" : "p-3"}>        <div className="search-input-container">
          <Form.Group className="mb-0">
            <div className="position-relative">
              {alwaysVisible && (
                <i className="bi bi-search position-absolute" 
                   style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', zIndex: 1 }}></i>
              )}
              <Form.Control
                type="text"
                placeholder={alwaysVisible ? "Tìm bạn bè..." : "Nhập tên hoặc username bạn bè..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus={!alwaysVisible}
                style={alwaysVisible ? { paddingLeft: '35px' } : {}}
              />
            </div>
          </Form.Group>
        </div>

        <div className="search-results mt-3">
          {loading && (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Đang tìm kiếm...</span>
              </div>
            </div>
          )}          {!loading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-3 text-muted">
              <i className="bi bi-search"></i>
              <p className="mb-0 mt-2">Không tìm thấy bạn bè nào</p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <ListGroup variant="flush">
              {searchResults.map((user) => (
                <ListGroup.Item
                  key={user.id}
                  className="user-search-item"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={user.profilePictureUrl || '/default-avatar.png'}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="user-avatar me-3"
                    />
                    <div className="user-info">
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="user-username text-muted">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}          {!hasSearched && searchTerm.length === 0 && (
            <div className="text-center py-3 text-muted">
              <i className="bi bi-person-plus" style={{ fontSize: '2rem' }}></i>
              <p className="mb-0 mt-2">Nhập tên để tìm kiếm bạn bè</p>
            </div>
          )}

          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <div className="text-center py-3 text-muted">
              <p className="mb-0">Nhập ít nhất 2 ký tự để tìm kiếm</p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>  );
};

export default UserSearch;
