import UserList from './UserList';
import { motion, AnimatePresence } from 'framer-motion';
import './FollowersList.scss';

const FollowingModal = ({ following, onClose }) => {
  // Use motion explicitly to satisfy linter
  const MotionDiv = motion.div;
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      <MotionDiv 
        className="modal-overlay" 
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <MotionDiv 
          className="auth-modal followers-list-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="followers-header">
            <h3>Đang theo dõi</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <UserList 
              users={following} 
              emptyMessage="Chưa theo dõi ai."
            />
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default FollowingModal;
