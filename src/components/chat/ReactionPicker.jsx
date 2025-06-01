import React, { useRef, useEffect } from 'react';
import { REACTION_EMOJIS } from '../../constants/reactions';
import styles from './ReactionPicker.module.scss';

const ReactionPicker = ({ isOpen, onClose, onReactionSelect, currentReaction = null }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReactionClick = (reactionType) => {
    onReactionSelect(reactionType);
    onClose();
  };
  return (
    <div ref={pickerRef} className={styles.reactionPicker}>
      <div className={styles.reactionGrid}>
        {[
          ['like', '👍'],
          ['love', '❤️'],
          ['haha', '😂'],
          ['wow', '😮'],
          ['sad', '😢'],
          ['angry', '😠']
        ].map(([type, emoji]) => (
          <button
            key={type}
            type="button"
            className={`${styles.reactionButton} ${
              currentReaction === type ? styles.selected : ''
            }`}
            onClick={() => handleReactionClick(type)}
            title={type}
          >
            <span className={styles.emoji}>{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionPicker;
