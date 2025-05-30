import api from './api';
import * as signalR from '@microsoft/signalr';

class ChatService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.messageHandlers = new Set();
    this.statusHandlers = new Set();
    this.conversationHandlers = new Set();
  }

  // API calls
  async getConversations() {
    try {
      const response = await api.get('/simple-chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }
  async getOrCreateConversation(otherUserId) {
    try {
      const response = await api.post(`/simple-chat/conversations/with/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId, page = 1, pageSize = 50) {
    try {
      const response = await api.get(`/simple-chat/conversations/${conversationId}/messages`, {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(conversationId, content, replyToMessageId = null) {
    try {
      const response = await api.post(`/simple-chat/conversations/${conversationId}/messages`, {
        content,
        replyToMessageId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  async markAsRead(conversationId) {
    try {
      await api.post(`/simple-chat/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }

  // SignalR connection
  async connect() {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('SignalR connection already in progress');
      return;
    }

    // If already connected, don't reconnect
    if (this.connection && this.isConnected) {
      console.log('SignalR already connected');
      return;
    }

    this.isConnecting = true;

    try {
      // Clean up any existing connection
      if (this.connection) {
        await this.disconnect();
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5063/chatHub', {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          logging: signalR.LogLevel.Warning
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .build();

      // Set up connection state handlers
      this.connection.onreconnecting((error) => {
        console.log('SignalR reconnecting...', error);
        this.isConnected = false;
      });

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected:', connectionId);
        this.isConnected = true;
      });

      this.connection.onclose((error) => {
        console.log('SignalR connection closed:', error);
        this.isConnected = false;
        this.isConnecting = false;
      });

      // Set up event handlers
      this.connection.on('ReceiveMessage', (message) => {
        this.messageHandlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      });

      this.connection.on('UserOnline', (userId) => {
        this.statusHandlers.forEach(handler => {
          try {
            handler(userId, true);
          } catch (error) {
            console.error('Error in status handler:', error);
          }
        });
      });

      this.connection.on('UserOffline', (userId) => {
        this.statusHandlers.forEach(handler => {
          try {
            handler(userId, false);
          } catch (error) {
            console.error('Error in status handler:', error);
          }
        });
      });      this.connection.on('ConversationUpdated', (conversation) => {
        this.conversationHandlers.forEach(handler => {
          try {
            handler(conversation);
          } catch (error) {
            console.error('Error in conversation handler:', error);
          }
        });
      });

      // Note: Removed NewMessage handler as notifications are disabled per user request

      this.connection.on('MessageRead', (data) => {
        this.messageHandlers.forEach(handler => {
          try {
            handler({
              type: 'messageRead',
              conversationId: data.ConversationId,
              userId: data.UserId
            });
          } catch (error) {
            console.error('Error in message read handler:', error);
          }
        });
      });

      console.log('Starting SignalR connection...');
      await this.connection.start();
      this.isConnected = true;
      this.isConnecting = false;
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('SignalR connection error:', error);
      this.isConnected = false;
      this.isConnecting = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        this.isConnected = false;
        this.isConnecting = false;
        await this.connection.stop();
        console.log('SignalR disconnected');
      } catch (error) {
        console.error('Error disconnecting SignalR:', error);
      }
      this.connection = null;
    }
  }

  // Event handlers
  onMessageReceived(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onUserStatusChanged(handler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  onConversationUpdated(handler) {
    this.conversationHandlers.add(handler);
    return () => this.conversationHandlers.delete(handler);
  }

  // SignalR methods
  async joinConversation(conversationId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('JoinConversation', conversationId);
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    }
  }

  async leaveConversation(conversationId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('LeaveConversation', conversationId);
      } catch (error) {
        console.error('Error leaving conversation:', error);
      }
    }
  }

  async sendSignalRMessage(conversationId, content, replyToMessageId = null) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('SendMessage', conversationId, content, replyToMessageId);
      } catch (error) {
        console.error('Error sending SignalR message:', error);
        throw error;
      }
    }
  }

  async markConversationAsRead(conversationId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('MarkAsRead', conversationId);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  }
}

// Export singleton instance
export default new ChatService();
