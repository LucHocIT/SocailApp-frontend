import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useChat } from '../../hooks/useChat';
import chatService from '../../services/chatService';
import { toast } from 'react-toastify';
import styles from './CreateChatModal.module.scss';

function CreateChatModal({ show, onHide }) {
  const { createChatRoom } = useChat();
    const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 1 // Group chat
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchUsers = useCallback(async () => {
    try {
      setIsSearching(true);
      const users = await chatService.searchUsers(searchTerm);
      setSearchResults(users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a chat room name');
      return;
    }

    if (selectedUsers.length < 2) {
      toast.error('Please select at least 2 members for the group chat');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const chatRoomData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        memberUserIds: selectedUsers.map(user => user.id)
      };

      await createChatRoom(chatRoomData);
      
      toast.success('Group chat created successfully!');
      handleClose();
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast.error('Failed to create group chat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: 1
    });
    setSelectedUsers([]);
    setSearchTerm('');
    setSearchResults([]);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" className={styles.createChatModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-users me-2"></i>
          Create Group Chat
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Chat Room Details */}
          <div className={styles.section}>
            <h6 className={styles.sectionTitle}>Group Details</h6>
            
            <Form.Group className="mb-3">
              <Form.Label>Group Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter group name"
                maxLength={50}
                required
              />
              <Form.Text className="text-muted">
                {formData.name.length}/50 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this group is about"
                maxLength={200}
              />
              <Form.Text className="text-muted">
                {formData.description.length}/200 characters
              </Form.Text>
            </Form.Group>
          </div>

          {/* Member Selection */}
          <div className={styles.section}>
            <h6 className={styles.sectionTitle}>Add Members</h6>
            
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className={styles.selectedUsers}>
                <small className="text-muted mb-2 d-block">
                  Selected members ({selectedUsers.length}):
                </small>
                <div className={styles.userBadges}>
                  {selectedUsers.map(user => (
                    <Badge 
                      key={user.id}
                      bg="primary" 
                      className={styles.userBadge}
                    >                      <img 
                        src={user.profilePictureUrl || '/default-avatar.svg'} 
                        alt={user.firstName}
                        className={styles.userBadgeAvatar}
                      />
                      <span>{user.firstName} {user.lastName}</span>
                      <button
                        type="button"
                        className={styles.removeBadge}
                        onClick={() => handleUserRemove(user.id)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* User Search */}
            <Form.Group className="mb-3">
              <Form.Label>Search Users</Form.Label>
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search users..."
                className={styles.searchInput}
              />
            </Form.Group>

            {/* Search Results */}
            {searchTerm.length >= 2 && (
              <div className={styles.searchResults}>
                {isSearching ? (
                  <div className="text-center p-3">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <ListGroup variant="flush">
                    {searchResults.map(user => (
                      <ListGroup.Item
                        key={user.id}
                        action
                        onClick={() => handleUserSelect(user)}
                        className={`${styles.userItem} ${
                          selectedUsers.find(u => u.id === user.id) ? styles.selected : ''
                        }`}
                      >
                        <div className={styles.userInfo}>                          <img 
                            src={user.profilePictureUrl || '/default-avatar.svg'} 
                            alt={user.firstName}
                            className={styles.userAvatar}
                          />
                          <div className={styles.userDetails}>
                            <div className={styles.userName}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className={styles.userUsername}>
                              @{user.username}
                            </div>
                          </div>
                          {selectedUsers.find(u => u.id === user.id) && (
                            <i className="fas fa-check text-success"></i>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center p-3 text-muted">
                    <i className="fas fa-search fa-2x mb-2"></i>
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}

            {searchTerm.length > 0 && searchTerm.length < 2 && (
              <Alert variant="info" className="mb-0">
                <small>Type at least 2 characters to search for users</small>
              </Alert>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSubmitting || !formData.name.trim() || selectedUsers.length < 2}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-plus me-2"></i>
                Create Group
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CreateChatModal;
