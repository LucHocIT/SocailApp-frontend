import { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './hooks';
import { toast } from 'react-toastify';

const SignalRContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
};

export const SignalRProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [connection, setConnection] = useState(null);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);

  // Khởi tạo kết nối SignalR
  useEffect(() => {    if (user && token) {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_SIGNALR_HUB_URL}/chatHub`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      connectionRef.current = newConnection;
      setConnection(newConnection);

      return () => {
        if (connectionRef.current) {
          connectionRef.current.stop();
        }
      };
    }
  }, [user, token]);

  // Quản lý trạng thái kết nối
  useEffect(() => {
    if (connection) {
      // Bắt đầu kết nối
      const startConnection = async () => {
        try {
          await connection.start();
          setIsConnected(true);
          setConnectionState('Connected');
          console.log('SignalR Connected');
        } catch (error) {
          console.error('SignalR Connection Error:', error);
          setIsConnected(false);
          setConnectionState('Disconnected');
          toast.error('Không thể kết nối đến server chat');
        }
      };

      // Lắng nghe các sự kiện kết nối
      connection.onclose(() => {
        setIsConnected(false);
        setConnectionState('Disconnected');
        console.log('SignalR Disconnected');
      });

      connection.onreconnecting(() => {
        setIsConnected(false);
        setConnectionState('Reconnecting');
        console.log('SignalR Reconnecting...');
      });

      connection.onreconnected(() => {
        setIsConnected(true);
        setConnectionState('Connected');
        console.log('SignalR Reconnected');
      });

      startConnection();

      return () => {
        if (connection) {
          connection.stop();
        }
      };
    }
  }, [connection]);

  // Gửi tin nhắn
  const sendMessage = async (receiverId, content) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('SendMessageToUser', receiverId, content);
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Không thể gửi tin nhắn');
        return false;
      }
    }
    return false;
  };

  // Lắng nghe tin nhắn
  const onReceiveMessage = (callback) => {
    if (connection) {
      connection.on('ReceiveMessage', callback);
    }
  };

  // Hủy lắng nghe tin nhắn
  const offReceiveMessage = (callback) => {
    if (connection) {
      connection.off('ReceiveMessage', callback);
    }
  };

  // Lắng nghe xác nhận tin nhắn đã gửi
  const onMessageSent = (callback) => {
    if (connection) {
      connection.on('MessageSent', callback);
    }
  };

  // Hủy lắng nghe xác nhận tin nhắn
  const offMessageSent = (callback) => {
    if (connection) {
      connection.off('MessageSent', callback);
    }
  };

  // Lắng nghe tin nhắn đã đọc
  const onMessageRead = (callback) => {
    if (connection) {
      connection.on('MessageRead', callback);
    }
  };

  // Hủy lắng nghe tin nhắn đã đọc
  const offMessageRead = (callback) => {
    if (connection) {
      connection.off('MessageRead', callback);
    }
  };

  // Đánh dấu tin nhắn đã đọc
  const markAsRead = async (messageId, senderId) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('MarkAsRead', messageId, senderId);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  // Lấy tin nhắn từ cache
  const getCachedMessages = async (otherUserId) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('GetCachedMessages', otherUserId);
      } catch (error) {
        console.error('Error getting cached messages:', error);
      }
    }
  };

  // Lắng nghe tin nhắn từ cache
  const onCachedMessages = (callback) => {
    if (connection) {
      connection.on('CachedMessages', callback);
    }
  };

  // Hủy lắng nghe tin nhắn từ cache
  const offCachedMessages = (callback) => {
    if (connection) {
      connection.off('CachedMessages', callback);
    }
  };

  const value = {
    connection,
    connectionState,
    isConnected,
    sendMessage,
    onReceiveMessage,
    offReceiveMessage,
    onMessageSent,
    offMessageSent,
    onMessageRead,
    offMessageRead,
    markAsRead,
    getCachedMessages,
    onCachedMessages,
    offCachedMessages
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};
