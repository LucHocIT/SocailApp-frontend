import api from './api';

export const notificationService = {    // Lấy danh sách notifications với phân trang
    async getNotifications(params = {}) {
        const defaultParams = {
            page: 1,
            pageSize: 20,
            isRead: null,
            type: null,
            fromDate: null,
            toDate: null
        };
        
        const queryParams = { ...defaultParams, ...params };
        const response = await api.get('/notification', { params: queryParams });
        return response.data;
    },

    // Lấy số lượng notifications chưa đọc
    async getUnreadCount() {
        const response = await api.get('/notification/unread-count');
        return response.data;
    },

    // Lấy thống kê notifications
    async getNotificationStats() {
        const response = await api.get('/notification/stats');
        return response.data;
    },

    // Đánh dấu notifications đã đọc
    async markAsRead(notificationIds) {
        const response = await api.post('/notification/mark-read', {
            notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds]
        });
        return response.data;
    },

    // Đánh dấu tất cả notifications đã đọc
    async markAllAsRead() {
        const response = await api.post('/notification/mark-all-read');
        return response.data;
    },

    // Xóa notification
    async deleteNotification(notificationId) {
        const response = await api.delete(`/notification/${notificationId}`);
        return response.data;
    },    // Xóa tất cả notifications đã đọc
    async deleteReadNotifications() {
        const response = await api.delete('/notification/read-notifications');
        return response.data;
    },

    // Lấy chi tiết notification
    async getNotificationById(notificationId) {
        const response = await api.get(`/notification/${notificationId}`);
        return response.data;
    }
};
