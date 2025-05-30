import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import { useChat } from '../../hooks/useChat';
import chatService from '../../services/chatService';
import { toast } from 'react-toastify';
import styles from './UserSearchModal.module.scss';

function UserSearchModal({ show, onHide }) {
  const { createPrivateChat, selectChat, chatRooms } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
  }, [searchTerm, searchUsers]);  const handleUserSelect = async (user) => {
    try {
      setIsCreating(true);
      
      // Check if private chat already exists
      const existingChat = chatRooms.find(room => 
        room.type === 0 && // Private chat
        room.members?.some(member => member.userId === user.id)
      );
      
      if (existingChat) {
        // Chat already exists, just select it
        selectChat(existingChat);
        toast.info(`Opened existing chat with ${user.firstName} ${user.lastName}`);
        handleClose();
        return;
      }
      
      // Use createPrivateChat which calls getOrCreatePrivateChat to avoid duplicates
      const chatRoom = await createPrivateChat(user.id);
      
      // Automatically select the chat room
      selectChat(chatRoom);
      
      toast.success(`Started chat with ${user.firstName} ${user.lastName}`);
      handleClose();
    } catch (error) {
      console.error('Error creating private chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md" className={styles.userSearchModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-comment me-2"></i>
          Start New Chat
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className={styles.searchSection}>
          <Form.Group className="mb-3">
            <Form.Label>Search for people</Form.Label>
            <Form.Control
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type name or username..."
              className={styles.searchInput}
              autoFocus
            />
            <Form.Text className="text-muted">
              Search by name or username to start a conversation
            </Form.Text>
          </Form.Group>

          {/* Search Results */}
          <div className={styles.resultsContainer}>
            {searchTerm.length >= 2 && (
              <div className={styles.searchResults}>
                {isSearching ? (
                  <div className="text-center p-4">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Searching for users...
                  </div>
                ) : searchResults.length > 0 ? (
                  <ListGroup variant="flush">
                    {searchResults.map(user => (
                      <ListGroup.Item
                        key={user.id}
                        action
                        onClick={() => handleUserSelect(user)}
                        className={styles.userItem}
                        disabled={isCreating}
                      >
                        <div className={styles.userInfo}>
                          <div className={styles.avatarContainer}>                            <img 
                              src={user.profilePictureUrl || '/default-avatar.svg'} 
                              alt={user.firstName}
                              className={styles.userAvatar}
                            />
                            {user.isOnline && (
                              <div className={styles.onlineIndicator}></div>
                            )}
                          </div>
                          
                          <div className={styles.userDetails}>
                            <div className={styles.userName}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className={styles.userUsername}>
                              @{user.username}
                            </div>
                            {user.isOnline && (
                              <div className={styles.onlineStatus}>
                                <i className="fas fa-circle text-success me-1"></i>
                                Online
                              </div>
                            )}
                          </div>

                          <div className={styles.actionButton}>
                            {isCreating ? (
                              <div className="spinner-border spinner-border-sm"></div>
                            ) : (
                              <i className="fas fa-comment"></i>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center p-4 text-muted">
                    <i className="fas fa-search fa-3x mb-3 opacity-50"></i>
                    <h6>No users found</h6>
                    <p className="mb-0 small">Try searching with a different name or username</p>
                  </div>
                )}
              </div>
            )}

            {searchTerm.length > 0 && searchTerm.length < 2 && (
              <Alert variant="info" className={styles.searchHint}>
                <i className="fas fa-info-circle me-2"></i>
                Type at least 2 characters to search for users
              </Alert>
            )}

            {searchTerm.length === 0 && (
              <div className="text-center p-4 text-muted">
                <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
                <h6>Find someone to chat with</h6>
                <p className="mb-0 small">Start typing to search for friends and colleagues</p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserSearchModal;
