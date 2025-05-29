import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from './hooks';
import { toast } from 'react-toastify';

const SignalRContext = createContext();

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
};

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { user, token } = useAuth();
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;  const createConnection = useCallback(() => {
    if (!token) {
      console.log('No token available for SignalR connection');
      return null;
    }

    const baseUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5063';
    console.log('Creating SignalR connection to:', `${baseUrl}/messageHub`);
    console.log('Token available:', token ? 'YES' : 'NO');
    console.log('Token length:', token ? token.length : 0);
    console.log('User available:', user ? 'YES' : 'NO');
    console.log('User ID:', user?.id);
    
    return new HubConnectionBuilder()
      .withUrl(`${baseUrl}/messageHub`, {
        accessTokenFactory: () => {
          console.log('AccessTokenFactory called, returning token:', token ? 'TOKEN_PROVIDED' : 'NO_TOKEN');
          return token;
        },
        withCredentials: false
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();
  }, [token, user]);

  const startConnection = useCallback(async (newConnection) => {
    if (!newConnection) return;

    try {
      setConnectionStatus('Connecting');
      await newConnection.start();
      
      setConnection(newConnection);
      setIsConnected(true);
      setConnectionStatus('Connected');
      setReconnectAttempts(0);
      
      console.log('SignalR Connected successfully');
      
      // Join user's personal group for receiving messages
      if (user?.id) {
        await newConnection.invoke('JoinUserGroup', user.id.toString());
        console.log(`Joined user group: ${user.id}`);
      }
      
    } catch (error) {
      console.error('SignalR Connection failed:', error);
      setConnectionStatus('Failed');
      setIsConnected(false);
      
      // Attempt reconnection
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          const retryConnection = createConnection();
          if (retryConnection) {
            startConnection(retryConnection);
          }
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
        toast.error('Không thể kết nối đến server tin nhắn');
      }
    }
  }, [user, reconnectAttempts, maxReconnectAttempts, createConnection]);

  const setupConnectionEvents = useCallback((newConnection) => {
    if (!newConnection) return;

    // Connection events
    newConnection.onclose((error) => {
      console.log('SignalR Connection closed:', error);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      setConnection(null);
    });

    newConnection.onreconnecting((error) => {
      console.log('SignalR Reconnecting:', error);
      setConnectionStatus('Reconnecting');
      setIsConnected(false);
    });

    newConnection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected:', connectionId);
      setConnectionStatus('Connected');
      setIsConnected(true);
      setReconnectAttempts(0);
      
      // Rejoin user group after reconnection
      if (user?.id) {
        newConnection.invoke('JoinUserGroup', user.id.toString()).catch(console.error);
      }
    });

    // Message events - these will be handled by individual components
    newConnection.on('ReceiveMessage', (messageData) => {
      console.log('Message received via SignalR:', messageData);
      // This event will be handled by MessageWidget and Messages page
    });

    newConnection.on('UserOnline', (userId) => {
      console.log('User came online:', userId);
      // Handle user online status
    });

    newConnection.on('UserOffline', (userId) => {
      console.log('User went offline:', userId);
      // Handle user offline status
    });

    newConnection.on('TypingStart', (conversationId, userId, userName) => {
      console.log('User started typing:', { conversationId, userId, userName });
      // Handle typing indicators
    });

    newConnection.on('TypingStop', (conversationId, userId) => {
      console.log('User stopped typing:', { conversationId, userId });
      // Handle typing indicators
    });
  }, [user]);  // Initialize connection when user and token are available
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const newConnection = createConnection();
    if (newConnection) {
      setupConnectionEvents(newConnection);
      startConnection(newConnection);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (newConnection) {
        newConnection.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  // Send message function
  const sendMessage = async (messageData) => {
    if (!connection || !isConnected) {
      throw new Error('SignalR connection is not available');
    }

    try {
      await connection.invoke('SendMessage', messageData);
    } catch (error) {
      console.error('Error sending message via SignalR:', error);
      throw error;
    }
  };

  // Join conversation function
  const joinConversation = async (conversationId) => {
    if (!connection || !isConnected) {
      console.warn('Cannot join conversation - SignalR not connected');
      return;
    }

    try {
      await connection.invoke('JoinConversation', conversationId.toString());
      console.log(`Joined conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  };

  // Leave conversation function
  const leaveConversation = async (conversationId) => {
    if (!connection || !isConnected) {
      return;
    }

    try {
      await connection.invoke('LeaveConversation', conversationId.toString());
      console.log(`Left conversation: ${conversationId}`);
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  };

  // Send typing indicator
  const sendTypingIndicator = async (conversationId, isTyping) => {
    if (!connection || !isConnected) {
      return;
    }

    try {
      if (isTyping) {
        await connection.invoke('StartTyping', conversationId.toString());
      } else {
        await connection.invoke('StopTyping', conversationId.toString());
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  const value = {
    connection,
    isConnected,
    connectionStatus,
    reconnectAttempts,
    maxReconnectAttempts,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingIndicator
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

export default SignalRContext;
