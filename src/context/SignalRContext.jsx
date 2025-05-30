import React, { createContext, useEffect, useState, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { useAuth } from './hooks';

export const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // Message event handlers
  const [messageReceivedHandlers, setMessageReceivedHandlers] = useState([]);
  const [messageSentHandlers, setMessageSentHandlers] = useState([]);

  // Initialize connection
  const initializeConnection = useCallback(async () => {
    if (!user || !token || connection) return;

    try {
      const newConnection = new HubConnectionBuilder()        .withUrl(`${import.meta.env.VITE_API_URL}/messageHub`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Connection state handlers
      newConnection.onreconnecting(() => {
        setIsConnected(false);
        setConnectionStatus('Reconnecting');
        console.log('SignalR reconnecting...');
      });

      newConnection.onreconnected(() => {
        setIsConnected(true);
        setConnectionStatus('Connected');
        console.log('SignalR reconnected');
      });

      newConnection.onclose(() => {
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        console.log('SignalR disconnected');
      });      // Message event listeners
      newConnection.on('ReceiveMessage', (message) => {
        messageReceivedHandlers.forEach(handler => handler(message));
      });

      newConnection.on('MessageSent', (message) => {
        messageSentHandlers.forEach(handler => handler(message));
      });

      newConnection.on('UserOnline', (userId) => {
        console.log(`User ${userId} is online`);
      });

      newConnection.on('UserOffline', (userId) => {
        console.log(`User ${userId} is offline`);
      });

      newConnection.on('TypingStarted', (data) => {
        console.log(`User ${data.userId} started typing in conversation ${data.conversationId}`);
      });

      newConnection.on('TypingStopped', (data) => {
        console.log(`User ${data.userId} stopped typing in conversation ${data.conversationId}`);
      });

      // Start connection
      await newConnection.start();
      setConnection(newConnection);
      setIsConnected(true);
      setConnectionStatus('Connected');
      console.log('SignalR connected successfully');

    } catch (error) {
      console.error('SignalR connection failed:', error);
      setConnectionStatus('Failed');
    }
  }, [user, token, connection, messageReceivedHandlers, messageSentHandlers]);

  // Send message
  const sendMessage = useCallback(async (receiverId, content, mediaFiles = null) => {
    if (!connection || connection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection not available');
    }

    try {
      const messageDto = {
        ReceiverId: receiverId,
        Content: content,
        MediaFiles: mediaFiles
      };

      await connection.invoke('SendMessage', messageDto);
    } catch (error) {
      console.error('Error sending message via SignalR:', error);
      throw error;
    }
  }, [connection]);

  // Join conversation
  const joinConversation = useCallback(async (conversationId) => {
    if (!connection || connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke('JoinConversation', conversationId);
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  }, [connection]);

  // Leave conversation
  const leaveConversation = useCallback(async (conversationId) => {
    if (!connection || connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke('LeaveConversation', conversationId);
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  }, [connection]);

  // Mark as read
  const markAsRead = useCallback(async (conversationId, lastReadMessageId = null) => {
    if (!connection || connection.state !== HubConnectionState.Connected) return;

    try {
      const markAsReadDto = {
        ConversationId: conversationId,
        LastReadMessageId: lastReadMessageId
      };
      await connection.invoke('MarkAsRead', markAsReadDto);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [connection]);

  // Set typing status
  const setTyping = useCallback(async (conversationId, isTyping) => {
    if (!connection || connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke('SetTyping', conversationId, isTyping);
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }, [connection]);

  // Event handler management
  const onReceiveMessage = useCallback((handler) => {
    setMessageReceivedHandlers(prev => [...prev, handler]);
  }, []);

  const offReceiveMessage = useCallback((handler) => {
    setMessageReceivedHandlers(prev => prev.filter(h => h !== handler));
  }, []);

  const onMessageSent = useCallback((handler) => {
    setMessageSentHandlers(prev => [...prev, handler]);
  }, []);

  const offMessageSent = useCallback((handler) => {
    setMessageSentHandlers(prev => prev.filter(h => h !== handler));
  }, []);
  // Initialize connection when user logs in
  useEffect(() => {
    if (user && token && !connection) {
      initializeConnection();
    }
  }, [user, token, connection, initializeConnection]);
  // Cleanup on unmount or user logout
  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
        setConnectionStatus('Disconnected');
      }
    };
  }, [user, connection]);

  const value = {
    connection,
    isConnected,
    connectionStatus,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    setTyping,
    onReceiveMessage,
    offReceiveMessage,
    onMessageSent,
    offMessageSent
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};
