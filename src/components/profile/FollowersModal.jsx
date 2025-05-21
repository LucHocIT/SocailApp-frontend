import UserList from './UserList';

const FollowersModal = ({ followers, onClose }) => {
  return (
    <div className="modal followers-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Người theo dõi</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <UserList 
            users={followers} 
            emptyMessage="Chưa có người theo dõi nào."
          />
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
