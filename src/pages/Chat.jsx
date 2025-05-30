import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/hooks';
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatWindow from '../components/chat/ChatWindow';
import CreateChatModal from '../components/chat/CreateChatModal';
import UserSearchModal from '../components/chat/UserSearchModal';
import styles from './Chat.module.scss';

function Chat() {
  const { user } = useAuth();
  const { 
    chatRooms, 
    currentChat, 
    isLoading, 
    connectionStatus,
    loadChatRooms 
  } = useChat();
  
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
  }, [user, loadChatRooms]);

  const handleCreatePrivateChat = () => {
    setShowUserSearch(true);
  };

  const handleCreateGroupChat = () => {
    setShowCreateChat(true);
  };

  return (
    <Container fluid className={styles.chatContainer}>
      <Row className="h-100">
        {/* Chat Room List */}
        <Col md={4} lg={3} className={styles.chatSidebar}>
          <Card className="h-100">            <Card.Header className={styles.chatHeader}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Messages</h5>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-light"
                    onClick={handleCreatePrivateChat}
                    title="Start new conversation"
                  >
                    <i className="fas fa-user-plus me-1"></i>
                    <span className="d-none d-md-inline">New Chat</span>
                  </button>
                  <button 
                    className="btn btn-sm btn-light"
                    onClick={handleCreateGroupChat}
                    title="Create group chat"
                  >
                    <i className="fas fa-users me-1"></i>
                    <span className="d-none d-lg-inline">Group</span>
                  </button>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className={`${styles.connectionStatus} mt-2`}>
                <span className={`badge ${
                  connectionStatus === 'connected' ? 'bg-success' : 
                  connectionStatus === 'reconnecting' ? 'bg-warning' : 'bg-danger'
                }`}>
                  {connectionStatus === 'connected' ? 'Online' : 
                   connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
                </span>
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              <ChatRoomList 
                chatRooms={chatRooms}
                isLoading={isLoading}
                currentChat={currentChat}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Chat Window */}
        <Col md={8} lg={9} className={styles.chatMain}>
          <Card className="h-100">
            {currentChat ? (
              <ChatWindow chatRoom={currentChat} />
            ) : (              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <i className="fas fa-comments fa-3x mb-3"></i>
                  <h4>Select a conversation</h4>
                  <p>Choose a chat from the sidebar to start messaging</p>
                  <div className="mt-3">
                    <button 
                      className="btn btn-primary me-2"
                      onClick={handleCreatePrivateChat}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Start New Conversation
                    </button>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleCreateGroupChat}
                    >
                      <i className="fas fa-users me-2"></i>
                      Create Group Chat
                    </button>
                  </div>
                </div>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <CreateChatModal 
        show={showCreateChat}
        onHide={() => setShowCreateChat(false)}
      />
      
      <UserSearchModal 
        show={showUserSearch}
        onHide={() => setShowUserSearch(false)}
      />
    </Container>
  );
}

export default Chat;
