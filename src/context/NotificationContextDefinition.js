import { createContext } from 'react';
import { NOTIFICATION_ACTIONS } from '../constants/notificationConstants';

// Initial state
export const initialState = {
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null,
    hasNextPage: false,
    hasPreviousPage: false
};

// Notification context
export const NotificationContext = createContext();

// Reducer
export function notificationReducer(state, action) {
    
    switch (action.type) {
        case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.payload.notifications,
                totalCount: action.payload.totalCount,
                currentPage: action.payload.pageNumber,
                totalPages: action.payload.totalPages,
                hasNextPage: action.payload.hasNextPage,
                hasPreviousPage: action.payload.hasPreviousPage,
                loading: false,
                error: null
            };
        
        case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
                unreadCount: state.unreadCount + 1
            };
        
        case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.map(notification =>
                    notification.id === action.payload.id ? action.payload : notification
                )
            };
        
        case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(
                    notification => notification.id !== action.payload
                ),
                totalCount: state.totalCount - 1
            };
        
        case NOTIFICATION_ACTIONS.SET_UNREAD_COUNT:
            return {
                ...state,
                unreadCount: action.payload
            };
        
        case NOTIFICATION_ACTIONS.MARK_AS_READ:
            return {
                ...state,
                notifications: state.notifications.map(notification =>
                    action.payload.includes(notification.id)
                        ? { ...notification, isRead: true }
                        : notification
                ),
                unreadCount: Math.max(0, state.unreadCount - action.payload.length)
            };
        
        case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
            return {
                ...state,
                notifications: state.notifications.map(notification => ({
                    ...notification,
                    isRead: true
                })),
                unreadCount: 0
            };
        
        case NOTIFICATION_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
        
        case NOTIFICATION_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        
        default:
            return state;
    }
}