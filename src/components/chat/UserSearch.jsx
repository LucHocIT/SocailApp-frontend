import React, { useState, useEffect } from 'react';
import { Card, Form, ListGroup, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import './UserSearch.scss';

const UserSearch = ({ onUserSelect, onClose, alwaysVisible = false, onSearchStateChange }) => {
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
        onSearchStateChange && onSearchStateChange(true);
      } else {
        setSearchResults([]);
        setHasSearched(false);
        onSearchStateChange && onSearchStateChange(false);
      }
    }, debounceTime);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, alwaysVisible, onSearchStateChange]);  const handleUserSelect = (user) => {
    onUserSelect(user);
    // Clear search after selecting user
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    onSearchStateChange && onSearchStateChange(false);
  };return (
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
                <i className="bi bi-search search-icon"></i>
              )}
              <Form.Control
                type="text"
                placeholder={alwaysVisible ? "Tìm bạn bè..." : "Nhập tên hoặc username bạn bè..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus={!alwaysVisible}
                className={alwaysVisible ? 'search-input-enhanced' : ''}
              />
              {alwaysVisible && searchTerm && (
                <button 
                  type="button"
                  className="btn btn-link clear-search-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setHasSearched(false);
                    onSearchStateChange && onSearchStateChange(false);
                  }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
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
            <div className="text-center py-4 text-muted empty-state">
              <i className="bi bi-emoji-frown" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}></i>
              <p className="mb-0">Không tìm thấy bạn bè nào</p>
              <small>Thử tìm kiếm với từ khóa khác</small>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="search-results-container">
              <ListGroup variant="flush">
                {searchResults.map((user) => (
                  <ListGroup.Item
                    key={user.id}
                    className="user-search-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="user-avatar-container">
                        <img
                          src={user.profilePictureUrl || '/default-avatar.png'}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="user-avatar me-3"
                        />
                        {user.isOnline && <div className="online-indicator"></div>}
                      </div>
                      <div className="user-info flex-grow-1">
                        <div className="user-name">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="user-username text-muted">
                          @{user.username}
                        </div>
                      </div>
                      <div className="chat-action">
                        <i className="bi bi-chat-dots text-muted"></i>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>          )}
        </div>
      </Card.Body>
    </Card>  );
};

export default UserSearch;
