// Notification Types - matching backend enum values
export const NOTIFICATION_TYPES = {
    LIKE: 1,
    COMMENT: 2,
    FOLLOW: 3,
    COMMENT_REPLY: 4,
    COMMENT_LIKE: 5,
    MENTION: 6,
    WELCOME: 7,
    SYSTEM: 8
};

// String to numeric mapping for backend compatibility
export const NOTIFICATION_TYPE_MAP = {
    'Like': 1,
    'Comment': 2,
    'Follow': 3,
    'CommentReply': 4,
    'CommentLike': 5,
    'Mention': 6,
    'Welcome': 7,
    'System': 8
};

// Notification Actions
export const NOTIFICATION_ACTIONS = {
    SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    MARK_AS_READ: 'MARK_AS_READ',
    MARK_ALL_AS_READ: 'MARK_ALL_AS_READ'
};
