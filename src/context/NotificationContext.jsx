import React, { useReducer, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './hooks';
import { NOTIFICATION_ACTIONS } from '../constants/notificationConstants';
import { NotificationContext, initialState, notificationReducer } from './NotificationContextDefinition';

// Provider component
export function NotificationProvider({ children }) {
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const { user } = useAuth();    // Load notifications
    const loadNotifications = useCallback(async (params = {}) => {
        if (!user) return;
        
        try {
            dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
            const data = await notificationService.getNotifications(params);
            dispatch({ type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS, payload: data });
        } catch (error) {
            dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
        }
    }, [user]);

    // Load unread count
    const loadUnreadCount = useCallback(async () => {
        if (!user) return;
        
        try {
            const count = await notificationService.getUnreadCount();
            dispatch({ type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT, payload: count });
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }, [user]);

    // Mark notifications as read
    const markAsRead = async (notificationIds) => {
        try {
            await notificationService.markAsRead(notificationIds);
            dispatch({ 
                type: NOTIFICATION_ACTIONS.MARK_AS_READ, 
                payload: Array.isArray(notificationIds) ? notificationIds : [notificationIds]
            });
        } catch (error) {
            dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
        } catch (error) {
            dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            dispatch({ type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
        } catch (error) {
            dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
        }
    };

    // Delete read notifications
    const deleteReadNotifications = async () => {
        try {
            await notificationService.deleteReadNotifications();
            // Reload notifications after deletion
            await loadNotifications();
        } catch (error) {
            dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
        }
    };    // Load initial data
    useEffect(() => {
        if (user) {
            loadNotifications();
            loadUnreadCount();
        }
    }, [user, loadNotifications, loadUnreadCount]);

    // Auto refresh unread count every 30 seconds
    useEffect(() => {
        if (!user) return;
        
        const interval = setInterval(() => {
            loadUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [user, loadUnreadCount]);

    const value = {
        ...state,
        loadNotifications,
        loadUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteReadNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}        </NotificationContext.Provider>
    );
}

export default NotificationProvider;
