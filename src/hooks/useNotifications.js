import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default'
  );

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (permission === 'granted') {
      return 'granted';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [permission]);

  const showNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted' || !('Notification' in window)) {
      return null;
    }

    return new Notification(title, {
      icon: '/logo.svg',
      badge: '/logo.svg',
      ...options
    });
  }, [permission]);

  const showMessageNotification = useCallback((message) => {
    return showNotification(`Tin nhắn từ ${message.senderName}`, {
      body: message.content,
      tag: `message-${message.senderId}`, // Prevent duplicate notifications
      requireInteraction: false
    });
  }, [showNotification]);

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
