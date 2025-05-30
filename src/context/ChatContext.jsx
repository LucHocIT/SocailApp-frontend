import React, { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import chatService from '../services/chatService';
import signalRService from '../services/signalRService';
import { useAuth } from './auth/AuthContext';
import { toast } from 'react-toastify';

const ChatContext = createContext();
export { ChatContext };

// Chat action types
const CHAT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CHAT_ROOMS: 'SET_CHAT_ROOMS',
  ADD_CHAT_ROOM: 'ADD_CHAT_ROOM',
  UPDATE_CHAT_ROOM: 'UPDATE_CHAT_ROOM',
  REMOVE_CHAT_ROOM: 'REMOVE_CHAT_ROOM',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  ADD_TYPING_USER: 'ADD_TYPING_USER',
  REMOVE_TYPING_USER: 'REMOVE_TYPING_USER',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  MARK_MESSAGES_READ: 'MARK_MESSAGES_READ',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT'
};

// Initial state
const initialState = {
  isLoading: false,
  error: null,
  chatRooms: [],
  currentChat: null,
  messages: [],
  typingUsers: [],
  connectionStatus: 'disconnected',
  unreadCounts: {}
};

// Chat reducer
function chatReducer(state, action) {
  switch (action.type) {
    case CHAT_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case CHAT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case CHAT_ACTIONS.SET_CHAT_ROOMS:
      return { ...state, chatRooms: action.payload, isLoading: false };
    
    case CHAT_ACTIONS.ADD_CHAT_ROOM:
      return { 
        ...state, 
        chatRooms: [action.payload, ...state.chatRooms] 
      };
    
    case CHAT_ACTIONS.UPDATE_CHAT_ROOM:
      return {
        ...state,
        chatRooms: state.chatRooms.map(room =>
          room.id === action.payload.id ? { ...room, ...action.payload } : room
        )
      };
    
    case CHAT_ACTIONS.REMOVE_CHAT_ROOM:
      return {
        ...state,
        chatRooms: state.chatRooms.filter(room => room.id !== action.payload),
        currentChat: state.currentChat?.id === action.payload ? null : state.currentChat
      };
    
    case CHAT_ACTIONS.SET_CURRENT_CHAT:
      return { ...state, currentChat: action.payload };
    
    case CHAT_ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload, isLoading: false };
    
    case CHAT_ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
    
    case CHAT_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
        )
      };
    
    case CHAT_ACTIONS.SET_TYPING_USERS:
      return { ...state, typingUsers: action.payload };
    
    case CHAT_ACTIONS.ADD_TYPING_USER:
      return {
        ...state,
        typingUsers: [...state.typingUsers.filter(user => user.userId !== action.payload.userId), action.payload]
      };
    
    case CHAT_ACTIONS.REMOVE_TYPING_USER:
      return {
        ...state,
        typingUsers: state.typingUsers.filter(user => user.userId !== action.payload)
      };
    
    case CHAT_ACTIONS.SET_CONNECTION_STATUS:
      return { ...state, connectionStatus: action.payload };
    
    case CHAT_ACTIONS.MARK_MESSAGES_READ:
      return {
        ...state,
        messages: state.messages.map(msg =>
          action.payload.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      };
    
    case CHAT_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.chatRoomId]: action.payload.count
        }
      };
    
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user, token } = useAuth();
  
  // Use refs to access current state in event handlers without causing re-renders
  const stateRef = useRef(state);
  stateRef.current = state;

  // Define connectToChat callback first
  const connectToChat = useCallback(async () => {
    try {
      await signalRService.connect(token);
      dispatch({ type: CHAT_ACTIONS.SET_CONNECTION_STATUS, payload: 'connected' });
    } catch (error) {
      console.error('Failed to connect to chat:', error);
      dispatch({ type: CHAT_ACTIONS.SET_CONNECTION_STATUS, payload: 'disconnected' });
    }
  }, [token]);

  // Initialize SignalR connection
  useEffect(() => {
    if (user && token) {
      connectToChat();
    }

    return () => {
      signalRService.disconnect();
    };
  }, [user, token, connectToChat]);
  // Setup SignalR event listeners
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: message });
      
      // Update last message in chat room
      dispatch({
        type: CHAT_ACTIONS.UPDATE_CHAT_ROOM,
        payload: { 
          id: message.chatRoomId, 
          lastMessage: message,
          lastActivity: message.sentAt 
        }
      });

      // Update unread count if not current chat
      const currentState = stateRef.current;
      if (!currentState.currentChat || currentState.currentChat.id !== message.chatRoomId) {
        dispatch({
          type: CHAT_ACTIONS.UPDATE_UNREAD_COUNT,
          payload: {
            chatRoomId: message.chatRoomId,
            count: (currentState.unreadCounts[message.chatRoomId] || 0) + 1
          }
        });
      }
    };

    const handleMessageRead = (data) => {
      const currentState = stateRef.current;
      const message = currentState.messages.find(m => m.id === data.messageId);
      dispatch({
        type: CHAT_ACTIONS.UPDATE_MESSAGE,
        payload: {
          id: data.messageId,
          readStatuses: [...(message?.readStatuses || []), {
            userId: data.userId,
            readAt: data.readAt
          }]
        }
      });
    };

    const handleUserTyping = (data) => {
      dispatch({ type: CHAT_ACTIONS.ADD_TYPING_USER, payload: data });
    };

    const handleUserStoppedTyping = (data) => {
      dispatch({ type: CHAT_ACTIONS.REMOVE_TYPING_USER, payload: data.userId });
    };

    const handleConnectionStatus = (data) => {
      dispatch({ type: CHAT_ACTIONS.SET_CONNECTION_STATUS, payload: data.status });
    };

    const handleError = (error) => {
      toast.error(error);
    };

    // Add event listeners
    signalRService.addListener('receiveMessage', handleReceiveMessage);
    signalRService.addListener('messageRead', handleMessageRead);
    signalRService.addListener('userTyping', handleUserTyping);
    signalRService.addListener('userStoppedTyping', handleUserStoppedTyping);
    signalRService.addListener('connectionStatus', handleConnectionStatus);
    signalRService.addListener('error', handleError);

    // Cleanup
    return () => {
      signalRService.removeListener('receiveMessage', handleReceiveMessage);
      signalRService.removeListener('messageRead', handleMessageRead);
      signalRService.removeListener('userTyping', handleUserTyping);
      signalRService.removeListener('userStoppedTyping', handleUserStoppedTyping);
      signalRService.removeListener('connectionStatus', handleConnectionStatus);
      signalRService.removeListener('error', handleError);
    };
  }, []); // Empty dependency array - handlers use refs to access current state
  const loadChatRooms = useCallback(async () => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      const response = await chatService.getChatRooms();
      dispatch({ type: CHAT_ACTIONS.SET_CHAT_ROOMS, payload: response.chatRooms || [] });
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to load chat rooms');
    }
  }, []);
  const selectChat = useCallback(async (chatRoom) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: chatRoom });
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
      
      // Join the chat room
      await signalRService.joinChatRoom(chatRoom.id);
      
      // Load messages
      const response = await chatService.getChatMessages(chatRoom.id);
      dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: response.messages || [] });
      
      // Reset unread count
      dispatch({
        type: CHAT_ACTIONS.UPDATE_UNREAD_COUNT,
        payload: { chatRoomId: chatRoom.id, count: 0 }
      });
    } catch (error) {
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to load chat');
    }
  }, []);  const sendMessage = useCallback(async (content, replyToMessageId = null) => {
    const currentState = stateRef.current;
    if (!currentState.currentChat) return;

    try {
      await signalRService.sendMessage(currentState.currentChat.id, content, replyToMessageId);
    } catch {
      toast.error('Failed to send message');
    }
  }, []);
  const createChatRoom = useCallback(async (chatRoomData) => {
    try {
      const newChatRoom = await chatService.createChatRoom(chatRoomData);
      dispatch({ type: CHAT_ACTIONS.ADD_CHAT_ROOM, payload: newChatRoom });
      return newChatRoom;
    } catch (error) {
      toast.error('Failed to create chat room');
      throw error;
    }
  }, []);

  const createPrivateChat = useCallback(async (otherUserId) => {
    try {
      const chatRoom = await chatService.getOrCreatePrivateChat(otherUserId);
      dispatch({ type: CHAT_ACTIONS.ADD_CHAT_ROOM, payload: chatRoom });
      return chatRoom;
    } catch (error) {
      toast.error('Failed to create private chat');
      throw error;
    }
  }, []);
  const startTyping = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.currentChat) {
      signalRService.startTyping(currentState.currentChat.id);
    }
  }, []);

  const stopTyping = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.currentChat) {
      signalRService.stopTyping(currentState.currentChat.id);
    }
  }, []);
  const markMessagesAsRead = useCallback(async (messageIds) => {
    const currentState = stateRef.current;
    if (!currentState.currentChat) return;

    try {
      await chatService.markMessagesAsRead(currentState.currentChat.id, messageIds);
      dispatch({ type: CHAT_ACTIONS.MARK_MESSAGES_READ, payload: messageIds });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, []);

  const value = {
    // State
    ...state,
    
    // Actions
    loadChatRooms,
    selectChat,
    sendMessage,
    createChatRoom,
    createPrivateChat,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    connectToChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}    </ChatContext.Provider>
  );
}
