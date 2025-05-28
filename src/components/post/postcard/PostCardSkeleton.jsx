import React from 'react';
import { Card } from 'react-bootstrap';
import styles from '../styles/postcard/PostCard.module.scss';

const PostCardSkeleton = () => {
  return (
    <Card className={styles.postCard}>
      <Card.Header className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <div className={`${styles.avatar} ${styles.shimmerEffect}`} style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
          <div style={{ width: '100%' }}>
            <div className={`${styles.shimmerEffect}`} style={{ height: '18px', width: '120px', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div className={`${styles.shimmerEffect}`} style={{ height: '14px', width: '80px', borderRadius: '4px' }}></div>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body className={styles.cardBody}>
        <div className={`${styles.shimmerEffect}`} style={{ height: '16px', width: '100%', borderRadius: '4px', marginBottom: '10px' }}></div>
        <div className={`${styles.shimmerEffect}`} style={{ height: '16px', width: '90%', borderRadius: '4px', marginBottom: '10px' }}></div>
        <div className={`${styles.shimmerEffect}`} style={{ height: '16px', width: '80%', borderRadius: '4px', marginBottom: '20px' }}></div>
        
        <div className={`${styles.mediaContainer} ${styles.shimmerEffect}`} style={{ height: '200px', borderRadius: '12px' }}></div>
      </Card.Body>
      
      <Card.Footer className={styles.cardFooter}>
        <div className={styles.actionButtons}>
          <div className={`${styles.shimmerEffect}`} style={{ height: '30px', width: '70px', borderRadius: '50px' }}></div>
          <div className={`${styles.shimmerEffect}`} style={{ height: '30px', width: '70px', borderRadius: '50px' }}></div>
          <div className={`${styles.shimmerEffect}`} style={{ height: '30px', width: '70px', borderRadius: '50px' }}></div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default PostCardSkeleton;
