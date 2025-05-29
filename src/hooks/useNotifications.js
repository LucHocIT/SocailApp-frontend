import { useState, useEffect } from 'react';

const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return permission;
  };

  const showNotification = (title, options = {}) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo.svg',
        badge: '/logo.svg',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  };

  const showMessageNotification = (message) => {
    return showNotification(`Tin nhắn từ ${message.senderName}`, {
      body: message.content,
      tag: `message-${message.senderId}`, // Prevent duplicate notifications
      requireInteraction: false
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showMessageNotification,
    isSupported: 'Notification' in window,
    isGranted: permission === 'granted'
  };
};

export default useNotifications;
