import UserList from './UserList';

const FollowingModal = ({ following, onClose }) => {
  return (
    <div className="modal following-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Đang theo dõi</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <UserList 
            users={following} 
            emptyMessage="Chưa theo dõi ai."
          />
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;
