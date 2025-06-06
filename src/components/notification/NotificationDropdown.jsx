import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash, FaCog } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotifications';
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

    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [page, setPage] = useState(1);
    const dropdownRef = useRef();    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications({ 
                page: 1, 
                pageSize: 20,
                isRead: filter === 'unread' ? false : filter === 'read' ? true : null
            });
            setPage(1);
        }
    }, [isOpen, filter, loadNotifications]);

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
    };

    const handleNotificationClick = (notification) => {
        // Handle navigation based on notification type
        console.log('Notification clicked:', notification);
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
        >
            <Dropdown.Toggle 
                variant="link" 
                className={styles.notificationToggle}
                id="notification-dropdown"
            >
                <FaBell className={styles.bellIcon} />
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
