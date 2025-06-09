import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { NOTIFICATION_TYPES, NOTIFICATION_TYPE_MAP } from '../../constants/notificationConstants';
import NotificationItem from './NotificationItem';
import styles from './NotificationDropdown.module.scss';

const NotificationDropdown = () => {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        hasNextPage,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteReadNotifications
    } = useNotifications();

    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [page, setPage] = useState(1);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [previousUnreadCount, setPreviousUnreadCount] = useState(0);    const dropdownRef = useRef();

// Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications({ 
                page: 1, 
                pageSize: 20,
                isRead: filter === 'unread' ? false : filter === 'read' ? true : null
            });
            setPage(1);
        }
    }, [isOpen, filter, loadNotifications]);    // Theo dõi thay đổi số lượng thông báo chưa đọc để kích hoạt hiệu ứng rung
    useEffect(() => {
        if (unreadCount > previousUnreadCount && previousUnreadCount > 0) {
            // Có thông báo mới đến
            setHasNewNotification(true);
            
            // Tắt hiệu ứng rung sau 10 giây
            const timer = setTimeout(() => {
                setHasNewNotification(false);
            }, 10000);
            
            return () => clearTimeout(timer);
        }
        setPreviousUnreadCount(unreadCount);
    }, [unreadCount, previousUnreadCount]);

    // Load more notifications
    const loadMore = () => {
        if (hasNextPage && !loading) {
            const nextPage = page + 1;
            loadNotifications({ 
                page: nextPage, 
                pageSize: 20,
                isRead: filter === 'unread' ? false : filter === 'read' ? true : null
            });
            setPage(nextPage);
        }
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handleDeleteReadNotifications = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo đã đọc?')) {
            deleteReadNotifications();
        }
    };    const handleNotificationClick = (notification) => {
        // Handle navigation based on notification type
        try {
            // Normalize notification type to handle both string and numeric types
            let notificationType = notification.type;
            if (typeof notificationType === 'string') {
                notificationType = NOTIFICATION_TYPE_MAP[notificationType] || notification.type;
            }
            
            switch (notificationType) {                case NOTIFICATION_TYPES.LIKE:
                case NOTIFICATION_TYPES.COMMENT:
                    // Navigate to the post page
                    if (notification.postId) {
                        // If it's a comment notification and we have comment ID, include it
                        if (notificationType === NOTIFICATION_TYPES.COMMENT && notification.commentId) {
                            navigate(`/post/${notification.postId}?commentId=${notification.commentId}`);
                        } else {
                            navigate(`/post/${notification.postId}`);
                        }
                    }
                    break;
                      
                case NOTIFICATION_TYPES.FOLLOW:
                    // Navigate to the user's profile who followed
                    if (notification.fromUser) {
                        // Use user ID for more reliable routing
                        navigate(`/profile/${notification.fromUser.id}`);
                    }
                    break;
                      case NOTIFICATION_TYPES.COMMENT_REPLY:
                case NOTIFICATION_TYPES.COMMENT_LIKE:
                    // Navigate to the post containing the comment with comment ID
                    if (notification.postId) {
                        if (notification.commentId) {
                            navigate(`/post/${notification.postId}?commentId=${notification.commentId}`);
                        } else {
                            navigate(`/post/${notification.postId}`);
                        }
                    } else if (notification.comment && notification.comment.postId) {
                        if (notification.comment.id) {
                            navigate(`/post/${notification.comment.postId}?commentId=${notification.comment.id}`);
                        } else {
                            navigate(`/post/${notification.comment.postId}`);
                        }
                    }
                    break;
                    
                case NOTIFICATION_TYPES.MENTION:
                    // Navigate to the post where user was mentioned
                    if (notification.postId) {
                        navigate(`/post/${notification.postId}`);
                    }
                    break;
                    
                case NOTIFICATION_TYPES.WELCOME:
                case NOTIFICATION_TYPES.SYSTEM:
                    // For welcome and system notifications, don't navigate anywhere
                    // Just mark as read, which is already handled in NotificationItem
                    break;
                    
                default:
                    console.log('Unknown notification type:', notification.type);
                    break;
            }
        } catch (error) {
            console.error('Error navigating from notification:', error);
        }
        
        // Close the dropdown after navigation
        setIsOpen(false);
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true;
    });

    return (
        <Dropdown 
            show={isOpen} 
            onToggle={setIsOpen}
            ref={dropdownRef}
            className={styles.notificationDropdown}
        >            <Dropdown.Toggle 
                variant="link" 
                className={styles.notificationToggle}
                id="notification-dropdown"
            >
                <FaBell className={`${styles.bellIcon} ${hasNewNotification ? styles.hasNewNotification : ''}`} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu 
                className={styles.notificationMenu}
                align="end"
            >
                {/* Header */}
                <div className={styles.header}>
                    <h6 className={styles.title}>Thông báo</h6>
                    <div className={styles.actions}>
                        {unreadCount > 0 && (
                            <button 
                                className={styles.actionButton}
                                onClick={handleMarkAllAsRead}
                                title="Đánh dấu tất cả đã đọc"
                            >
                                <FaCheck />
                            </button>
                        )}
                        <button 
                            className={styles.actionButton}
                            onClick={handleDeleteReadNotifications}
                            title="Xóa thông báo đã đọc"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className={styles.filterTabs}>
                    <button 
                        className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`${styles.filterTab} ${filter === 'unread' ? styles.active : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Chưa đọc ({unreadCount})
                    </button>
                </div>

                {/* Notifications list */}
                <div className={styles.notificationsList}>
                    {loading && notifications.length === 0 ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <span>Đang tải...</span>
                        </div>
                    ) : error ? (
                        <div className={styles.error}>
                            <span>Có lỗi xảy ra: {error}</span>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className={styles.empty}>
                            <FaBell className={styles.emptyIcon} />
                            <span>Không có thông báo nào</span>
                        </div>
                    ) : (
                        <>
                            {filteredNotifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                    onDelete={deleteNotification}
                                    onClick={handleNotificationClick}
                                />
                            ))}
                            
                            {hasNextPage && (
                                <div className={styles.loadMore}>
                                    <button 
                                        onClick={loadMore}
                                        disabled={loading}
                                        className={styles.loadMoreButton}
                                    >
                                        {loading ? 'Đang tải...' : 'Xem thêm'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.viewAllButton}>
                        Xem tất cả thông báo
                    </button>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationDropdown;
