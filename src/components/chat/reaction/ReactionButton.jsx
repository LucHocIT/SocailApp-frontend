import React, { useState } from 'react';
import ReactionPicker from './ReactionPicker';
import styles from './ReactionButton.module.scss';

const ReactionButton = ({ onReactionSelect, currentReaction = null, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };

  const handleReactionSelect = (reactionType) => {
    if (onReactionSelect) {
      onReactionSelect(reactionType);
    }
    setShowPicker(false);
  };

  const handleClosePicker = () => {
    setShowPicker(false);
  };

  return (
    <div className={styles.reactionButtonContainer}>
      <button
        type="button"
        className={`${styles.reactionButton} ${
          currentReaction ? styles.hasReaction : ''
        } ${disabled ? styles.disabled : ''}`}
        onClick={handleButtonClick}
        disabled={disabled}
        title="Add reaction"
      >
        <svg 
          className={styles.icon} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </button>
      
      <ReactionPicker
        isOpen={showPicker}
        onClose={handleClosePicker}
        onReactionSelect={handleReactionSelect}
        currentReaction={currentReaction}
      />
    </div>
  );
};

export default ReactionButton;
