import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  async connect(token) {
    if (this.connection && this.isConnected) {
      return;
    }

    try {      this.connection = new HubConnectionBuilder()
        .withUrl('http://localhost:5063/chatHub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event listeners
      this.setupEventListeners();

      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR Connected');
    } catch (error) {
      console.error('SignalR Connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
      this.listeners.clear();
      console.log('SignalR Disconnected');
    }
  }

  setupEventListeners() {
    if (!this.connection) return;

    this.connection.onreconnecting(() => {
      this.isConnected = false;
      this.notifyListeners('connectionStatus', { status: 'reconnecting' });
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
      this.notifyListeners('connectionStatus', { status: 'connected' });
    });

    this.connection.onclose(() => {
      this.isConnected = false;
      this.notifyListeners('connectionStatus', { status: 'disconnected' });
    });

    // Chat events
    this.connection.on('ReceiveMessage', (message) => {
      this.notifyListeners('receiveMessage', message);
    });

    this.connection.on('MessageRead', (data) => {
      this.notifyListeners('messageRead', data);
    });

    this.connection.on('UserTyping', (data) => {
      this.notifyListeners('userTyping', data);
    });

    this.connection.on('UserStoppedTyping', (data) => {
      this.notifyListeners('userStoppedTyping', data);
    });

    this.connection.on('ReactionAdded', (data) => {
      this.notifyListeners('reactionAdded', data);
    });

    this.connection.on('ReactionRemoved', (data) => {
      this.notifyListeners('reactionRemoved', data);
    });

    this.connection.on('Error', (error) => {
      this.notifyListeners('error', error);
    });
  }

  // Chat methods
  async joinChatRoom(chatRoomId) {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('JoinChatRoom', chatRoomId);
    }
  }

  async leaveChatRoom(chatRoomId) {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('LeaveChatRoom', chatRoomId);
    }
  }

  async sendMessage(chatRoomId, content, replyToMessageId = null) {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('SendMessage', chatRoomId, content, replyToMessageId);
    }
  }

  async markMessageAsRead(messageId) {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('MarkMessageAsRead', messageId);
    }
  }

  async addReaction(messageId, reactionType) {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('AddReaction', messageId, reactionType);
    }
  }

  async startTyping(chatRoomId) {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('StartTyping', chatRoomId);
    }
  }

  async stopTyping(chatRoomId) {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('StopTyping', chatRoomId);
    }
  }

  // Event listener management
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  getConnectionState() {
    return {
      isConnected: this.isConnected,
      state: this.connection?.state || 'Disconnected'
    };
  }
}

export default new SignalRService();
