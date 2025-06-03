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

  async uploadChatMedia(mediaFile, mediaType) {
    try {
      const formData = new FormData();
      formData.append('mediaFile', mediaFile);
      formData.append('mediaType', mediaType);

      const response = await api.post('/simple-chat/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading chat media:', error);
      throw error.response?.data || { message: 'Error uploading media' };
    }
  }  async sendTemporaryLocationMessage(conversationId, latitude, longitude, address = null, replyToMessageId = null) {
    try {
      // Gửi qua SignalR với các tham số riêng biệt như backend mong đợi
      if (this.connection && this.isConnected) {
        await this.connection.invoke('SendTemporaryLocationMessage', conversationId, latitude, longitude, address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        return {
          id: `temp_location_${Date.now()}`,
          conversationId,
          content: address || `📍 Đã chia sẻ vị trí`,
          messageType: 'location',
          latitude,
          longitude,
          address,
          isTemporary: true,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 giờ từ bây giờ
          sentAt: new Date(),
          replyToMessageId
        };
      } else {
        throw new Error('Kết nối SignalR không khả dụng');
      }
    } catch (error) {
      console.error('Error sending temporary location message:', error);
      throw error;
    }
  }

  async sendMediaMessage(conversationId, mediaData, replyToMessageId = null) {
    try {
      const messageData = {
        content: null,
        replyToMessageId,
        mediaUrl: mediaData.mediaUrl,
        mediaType: mediaData.mediaType,
        mediaPublicId: mediaData.publicId,
        mediaMimeType: mediaData.mimeType,
        mediaFilename: mediaData.filename,
        mediaFileSize: mediaData.fileSize
      };

      const response = await api.post(`/simple-chat/conversations/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  // Message Reaction API methods
  async addMessageReaction(messageId, reactionType) {
    try {
      const response = await api.post(`/simple-chat/messages/${messageId}/reactions`, {
        reactionType
      });
      return response.data;
    } catch (error) {
      console.error('Error adding message reaction:', error);
      throw error;
    }
  }

  async removeMessageReaction(messageId) {
    try {
      await api.delete(`/simple-chat/messages/${messageId}/reactions`);
    } catch (error) {
      console.error('Error removing message reaction:', error);
      throw error;
    }
  }

  async toggleMessageReaction(messageId, reactionType) {
    try {
      const response = await api.put(`/simple-chat/messages/${messageId}/reactions/toggle`, {
        reactionType
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling message reaction:', error);
      throw error;
    }
  }

  async getMessageReactions(messageId) {
    try {
      const response = await api.get(`/simple-chat/messages/${messageId}/reactions`);
      return response.data;
    } catch (error) {
      console.error('Error getting message reactions:', error);
      throw error;
    }
  }

  async getMessageReactionDetails(messageId) {
    try {
      const response = await api.get(`/simple-chat/messages/${messageId}/reactions/details`);
      return response.data;
    } catch (error) {
      console.error('Error getting message reaction details:', error);
      throw error;
    }
  }

  async getMessageReactionsByType(messageId, reactionType) {
    try {
      const response = await api.get(`/simple-chat/messages/${messageId}/reactions/${reactionType}`);
      return response.data;
    } catch (error) {
      console.error('Error getting message reactions by type:', error);
      throw error;
    }
  }

  // SignalR connection
  async connect() {
    if (this.isConnecting) {
      console.log('SignalR connection already in progress');
      return;
    }

    if (this.connection && this.isConnected) {
      console.log('SignalR already connected');
      return;
    }

    this.isConnecting = true;

    try {
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
      });

      this.connection.on('ConversationUpdated', (conversation) => {
        this.conversationHandlers.forEach(handler => {
          try {
            handler(conversation);
          } catch (error) {
            console.error('Error in conversation handler:', error);
          }
        });
      });

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
      });      // Message Reaction SignalR handlers
      this.connection.on('ReactionAdded', (data) => {
        this.messageHandlers.forEach(handler => {
          try {
            handler({
              type: 'reactionAdded',
              messageId: data.MessageId,
              reaction: {
                reactionType: data.ReactionType,
                userId: data.UserId,
                userName: data.UserName
              },
              conversationId: data.ConversationId,
              reactionSummary: data.ReactionSummary
            });
          } catch (error) {
            console.error('Error in reaction added handler:', error);
          }
        });
      });

      this.connection.on('ReactionRemoved', (data) => {
        this.messageHandlers.forEach(handler => {
          try {
            handler({
              type: 'reactionRemoved',
              messageId: data.MessageId,
              userId: data.UserId,
              reactionType: data.ReactionType,
              conversationId: data.ConversationId,
              reactionSummary: data.ReactionSummary
            });
          } catch (error) {
            console.error('Error in reaction removed handler:', error);
          }
        });
      });

      this.connection.on('MessageReactionUpdated', (data) => {
        this.messageHandlers.forEach(handler => {
          try {
            handler({
              type: 'reactionUpdated',
              messageId: data.MessageId,
              reactions: data.Reactions,
              conversationId: data.ConversationId
            });
          } catch (error) {
            console.error('Error in reaction updated handler:', error);
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

export default new ChatService();
