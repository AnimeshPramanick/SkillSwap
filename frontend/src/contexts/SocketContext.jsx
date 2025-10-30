import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuthContext } from './AuthContext';
import toast from 'react-hot-toast';

// Create socket context
const SocketContext = createContext();

// Socket connection state
const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const { user, tokens, isAuthenticated } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Refs for managing cleanup
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, tokens?.accessToken, user]);

  // Connect to socket
  const connectSocket = () => {
    if (socketRef.current?.connected) {
      return;
    }

    try {
      setConnectionState(CONNECTION_STATES.CONNECTING);

      // Create socket connection
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: tokens.accessToken,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Set up event listeners
      setupSocketListeners(newSocket);

    } catch (error) {
      console.error('Socket connection error:', error);
      setConnectionState(CONNECTION_STATES.ERROR);
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    }
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    // Clear timeouts and intervals
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Reset state
    setConnectionState(CONNECTION_STATES.DISCONNECTED);
    setOnlineUsers(new Set());
    setTypingUsers(new Map());
    setIncomingCall(null);
  };

  // Setup socket event listeners
  const setupSocketListeners = (socket) => {
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnectionState(CONNECTION_STATES.CONNECTED);
      setConnectionState(CONNECTION_STATES.CONNECTED);
      
      // Start heartbeat
      startHeartbeat();
      
      toast.success('Connected to real-time updates');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
      
      // Stop heartbeat
      stopHeartbeat();
      
      if (reason === 'io server disconnect') {
        // Server disconnected, don't auto-reconnect
        toast.error('Connection lost');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionState(CONNECTION_STATES.ERROR);
      
      // Schedule reconnection attempt
      scheduleReconnect();
    });

    // User status events
    socket.on('connected', (data) => {
      console.log('User connected:', data);
    });

    socket.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    // Message events
    socket.on('new_message', (message) => {
      // Handle new message
      handleNewMessage(message);
    });

    socket.on('message_sent', (data) => {
      // Handle message sent confirmation
      handleMessageSent(data);
    });

    socket.on('message_history', (data) => {
      // Handle message history
      handleMessageHistory(data);
    });

    // Typing events
    socket.on('user_typing', (data) => {
      handleUserTyping(data);
    });

    // Video call events
    socket.on('incoming_video_call', (callData) => {
      setIncomingCall(callData);
      toast.info(`${callData.callerName} is calling you...`);
    });

    socket.on('call_accepted', (data) => {
      toast.success('Call accepted');
      // Handle call accepted
    });

    socket.on('call_rejected', (data) => {
      toast.info('Call was rejected');
      setIncomingCall(null);
    });

    socket.on('call_ended', (data) => {
      toast.info('Call ended');
      setIncomingCall(null);
    });

    socket.on('call_failed', (data) => {
      toast.error(`Call failed: ${data.error}`);
      setIncomingCall(null);
    });

    // WebRTC signaling events
    socket.on('webrtc_offer', (data) => {
      // Handle WebRTC offer
      console.log('WebRTC offer received:', data);
    });

    socket.on('webrtc_answer', (data) => {
      // Handle WebRTC answer
      console.log('WebRTC answer received:', data);
    });

    socket.on('webrtc_ice_candidate', (data) => {
      // Handle ICE candidate
      console.log('ICE candidate received:', data);
    });

    // Match events
    socket.on('match_message', (data) => {
      // Handle match room message
      console.log('Match message:', data);
    });

    // General notification events
    socket.on('notification', (notification) => {
      // Handle general notifications
      handleNotification(notification);
    });
  };

  // Start heartbeat to keep connection alive
  const startHeartbeat = () => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
      }
    }, 30000); // Send ping every 30 seconds
  };

  // Stop heartbeat
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  // Schedule reconnection attempt
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && tokens?.accessToken) {
        connectSocket();
      }
    }, 5000); // Try to reconnect after 5 seconds
  };

  // Handle new message
  const handleNewMessage = (message) => {
    // Emit custom event that components can listen to
    window.dispatchEvent(new CustomEvent('socket_message', { detail: message }));
    
    // Show notification if message is not from current user
    if (message.senderId !== user.id) {
      toast.success(`New message from ${message.sender?.name || 'Unknown'}`);
    }
  };

  // Handle message sent confirmation
  const handleMessageSent = (data) => {
    window.dispatchEvent(new CustomEvent('socket_message_sent', { detail: data }));
  };

  // Handle message history
  const handleMessageHistory = (data) => {
    window.dispatchEvent(new CustomEvent('socket_message_history', { detail: data }));
  };

  // Handle user typing
  const handleUserTyping = (data) => {
    if (data.isTyping) {
      setTypingUsers(prev => new Map(prev.set(data.userId, Date.now())));
    } else {
      setTypingUsers(prev => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    }

    window.dispatchEvent(new CustomEvent('socket_typing', { detail: data }));
  };

  // Handle general notification
  const handleNotification = (notification) => {
    // Show toast notification
    if (notification.type === 'success') {
      toast.success(notification.message);
    } else if (notification.type === 'error') {
      toast.error(notification.message);
    } else {
      toast(notification.message);
    }

    // Emit custom event
    window.dispatchEvent(new CustomEvent('socket_notification', { detail: notification }));
  };

  // Socket action methods
  const sendMessage = (recipientId, message, messageType = 'text') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        recipientId,
        message,
        messageType,
      });
    }
  };

  const startTyping = (recipientId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { recipientId });
    }
  };

  const stopTyping = (recipientId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { recipientId });
    }
  };

  const requestVideoCall = (recipientId, callType = 'video') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('video_call_request', { recipientId, callType });
      toast.info('Calling...');
    }
  };

  const respondToCall = (callerId, accepted) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('video_call_response', { callerId, accepted });
      setIncomingCall(null);
    }
  };

  const sendWebRTCOffer = (recipientId, offer) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('webrtc_offer', { recipientId, offer });
    }
  };

  const sendWebRTCAnswer = (recipientId, answer) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('webrtc_answer', { recipientId, answer });
    }
  };

  const sendICECandidate = (recipientId, candidate) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('webrtc_ice_candidate', { recipientId, candidate });
    }
  };

  const endVideoCall = (recipientId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('end_video_call', { recipientId });
    }
  };

  const joinMatchRoom = (matchId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_match_room', { matchId });
    }
  };

  const sendMatchMessage = (matchId, message) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_match_message', { matchId, message });
    }
  };

  const getMessageHistory = (recipientId, limit = 50) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get_message_history', { recipientId, limit });
    }
  };

  // Dismiss incoming call
  const dismissIncomingCall = () => {
    setIncomingCall(null);
  };

  // Context value
  const value = {
    // State
    socket,
    connectionState,
    isConnected: connectionState === CONNECTION_STATES.CONNECTED,
    onlineUsers: Array.from(onlineUsers),
    typingUsers: Array.from(typingUsers.entries()).map(([userId, timestamp]) => ({
      userId,
      timestamp,
    })),
    incomingCall,
    
    // Connection methods
    connectSocket,
    disconnectSocket,
    
    // Action methods
    sendMessage,
    startTyping,
    stopTyping,
    requestVideoCall,
    respondToCall,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendICECandidate,
    endVideoCall,
    joinMatchRoom,
    sendMatchMessage,
    getMessageHistory,
    dismissIncomingCall,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

// Export constants for external use
export { CONNECTION_STATES };
export default SocketContext;