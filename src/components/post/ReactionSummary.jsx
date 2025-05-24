import React from 'react';
import { getReactionEmoji } from '../../services/postService';

const ReactionSummary = ({ reactionCounts = {}, totalCount = 0 }) => {
  // Get the top 3 reaction types by count
  const topReactions = Object.entries(reactionCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3);
    
  if (totalCount === 0 || topReactions.length === 0) {
    return null;
  }
  
  return (
    <div 
      className="reaction-summary"
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '2px',
        fontSize: '0.875rem'
      }}
    >
      {/* Show emojis for top reactions */}
      <div className="reaction-emoji-stack" style={{ display: 'flex', marginRight: '4px' }}>
        {topReactions.map(([type], index) => (
          <div 
            key={type}
            style={{
              zIndex: topReactions.length - index,
              marginLeft: index > 0 ? '-6px' : '0',
              fontSize: '1rem',
              border: '1px solid var(--card-bg)',
              borderRadius: '50%',
              background: 'var(--card-bg)',
            }}
          >
            {getReactionEmoji(type)}
          </div>
        ))}
      </div>
      
      {/* Show total count */}
      <span className="reaction-count" style={{ color: 'var(--text-muted)' }}>
        {totalCount}
      </span>
    </div>
  );
};

export default ReactionSummary;
