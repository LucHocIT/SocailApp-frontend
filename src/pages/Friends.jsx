import React, { useState, useEffect } from 'react';
import styles from './Friends.module.scss';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for friends loading
    setTimeout(() => {
      setFriends([]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className={styles.friendsPage}>
      <div className={styles.header}>
        <h1>Friends</h1>
      </div>
      
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading friends...</div>
        ) : friends.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>👥</div>
            <h2>No friends yet</h2>
            <p>Start connecting with people to see them here!</p>
          </div>
        ) : (
          <div className={styles.friendsList}>
            {friends.map(friend => (
              <div key={friend.id} className={styles.friendCard}>
                <div className={styles.avatar}>
                  {friend.avatar ? (
                    <img src={friend.avatar} alt="" />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {friend.firstName?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className={styles.friendInfo}>
                  <h3>{friend.firstName} {friend.lastName}</h3>
                  <p>{friend.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
