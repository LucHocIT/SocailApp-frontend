import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
    FaHeart, 
    FaComment, 
    FaUserPlus, 
    FaReply, 
    FaThumbsUp, 
    FaGift, 
    FaBell,
    FaTimes 
} from 'react-icons/fa';
import { NOTIFICATION_TYPES } from '../../constants/notificationConstants';
import styles from './NotificationItem.module.scss';

const NotificationItem = ({ 
    notification, 
    onMarkAsRead, 
    onDelete, 
    onClick 
}) => {
    const getNotificationIcon = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.LIKE:
                return <FaHeart className={styles.likeIcon} />;
            case NOTIFICATION_TYPES.COMMENT:
                return <FaComment className={styles.commentIcon} />;
            case NOTIFICATION_TYPES.FOLLOW:
                return <FaUserPlus className={styles.followIcon} />;
            case NOTIFICATION_TYPES.COMMENT_REPLY:
                return <FaReply className={styles.replyIcon} />;
            case NOTIFICATION_TYPES.COMMENT_LIKE:
                return <FaThumbsUp className={styles.likeIcon} />;
            case NOTIFICATION_TYPES.WELCOME:
                return <FaGift className={styles.welcomeIcon} />;
            case NOTIFICATION_TYPES.SYSTEM:
                return <FaBell className={styles.systemIcon} />;
            default:
                return <FaBell className={styles.defaultIcon} />;
        }
    };    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead([notification.id]);
        }
        if (onClick) {
            onClick(notification);
        }
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(notification.id);
    };

    return (
        <div 
            className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
            onClick={handleClick}
        >
            <div className={styles.notificationContent}>
                <div className={styles.iconWrapper}>
                    {getNotificationIcon(notification.type)}
                </div>
                
                <div className={styles.contentWrapper}>
                    <div className={styles.userInfo}>
                        {notification.fromUser && (
                            <img 
                                src={notification.fromUser.profilePicture || '/default-avatar.png'} 
                                alt={notification.fromUser.fullName}
                                className={styles.avatar}
                            />
                        )}
                    </div>
                    
                    <div className={styles.textContent}>
                        <p className={styles.content}>
                            {notification.content}
                        </p>
                        
                        {notification.post && (
                            <div className={styles.postPreview}>
                                {notification.post.firstMediaUrl && (
                                    <img 
                                        src={notification.post.firstMediaUrl} 
                                        alt="Post preview"
                                        className={styles.postImage}
                                    />
                                )}
                                <span className={styles.postContent}>
                                    {notification.post.content?.substring(0, 50)}
                                    {notification.post.content?.length > 50 ? '...' : ''}
                                </span>
                            </div>
                        )}
                        
                        <div className={styles.metadata}>
                            <span className={styles.time}>
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: vi
                                })}
                            </span>
                            {!notification.isRead && (
                                <span className={styles.unreadDot}></span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <button 
                className={styles.deleteButton}
                onClick={handleDelete}
                title="Xóa thông báo"
            >
                <FaTimes />
            </button>
        </div>
    );
};

export default NotificationItem;
