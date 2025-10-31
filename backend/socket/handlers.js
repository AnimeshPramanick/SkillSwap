const jwt = require("jsonwebtoken");
const {
  getUser,
  updateUser,
  createMessage,
  getConversationMessages,
} = require("../config/firebase");

// Store active connections
const activeConnections = new Map();
const userSockets = new Map();

const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getUser(decoded.userId);

      if (!user || !user.isActive) {
        return next(new Error("Authentication error: Invalid user"));
      }

      socket.userId = user.id;
      socket.userData = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Update user online status
    updateUserOnlineStatus(socket.userId, true);

    // Store connection
    activeConnections.set(socket.id, socket.userId);
    userSockets.set(socket.userId, socket.id);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    console.log(`User ${socket.userId} joined room: user_${socket.userId}`);

    // Notify about new connection
    socket.emit("connected", {
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // Handle chat message
    socket.on("send_message", async (data) => {
      try {
        const { recipientId, message, messageType = "text" } = data;

        if (!recipientId || !message) {
          socket.emit("error", { error: "Missing required fields" });
          return;
        }

        // Create message in database
        const messageData = {
          senderId: socket.userId,
          recipientId,
          message,
          messageType,
          participants: [socket.userId, recipientId].sort().join("_"),
          isRead: false,
        };

        const messageId = await createMessage(messageData);

        // Get recipient's socket
        const recipientSocketId = userSockets.get(recipientId);

        if (recipientSocketId) {
          io.to(`user_${recipientId}`).emit("new_message", {
            id: messageId,
            ...messageData,
            timestamp: new Date().toISOString(),
          });
        }

        // Send confirmation to sender
        socket.emit("message_sent", {
          id: messageId,
          status: "sent",
          timestamp: new Date().toISOString(),
        });

        // Send push notification if recipient is offline
        if (!recipientSocketId) {
          // Here you would integrate with FCM for push notifications
          console.log(
            `User ${recipientId} is offline, would send push notification`
          );
        }
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { error: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      const { recipientId } = data;
      if (recipientId) {
        io.to(`user_${recipientId}`).emit("typing_start", {
          userId: socket.userId,
          isTyping: true,
        });
      }
    });

    socket.on("typing_stop", (data) => {
      const { recipientId } = data;
      if (recipientId) {
        io.to(`user_${recipientId}`).emit("typing_stop", {
          userId: socket.userId,
          isTyping: false,
        });
      }
    });

    // Handle video call signaling
    socket.on("video_call_request", (data) => {
      const { recipientId, callType = "video" } = data;
      const recipientSocketId = userSockets.get(recipientId);

      if (recipientSocketId) {
        io.to(`user_${recipientId}`).emit("incoming_video_call", {
          callerId: socket.userId,
          callerName: socket.userData.profile.name,
          callType,
          timestamp: new Date().toISOString(),
        });

        socket.emit("call_requested", {
          recipientId,
          status: "pending",
        });
      } else {
        socket.emit("call_failed", { error: "User is offline" });
      }
    });

    socket.on("video_call_response", (data) => {
      const { callerId, accepted } = data;
      const callerSocketId = userSockets.get(callerId);

      if (callerSocketId) {
        if (accepted) {
          // Generate room ID for the call
          const callRoom = `call_${[socket.userId, callerId].sort().join("_")}`;

          io.to(`user_${callerId}`).emit("call_accepted", {
            recipientId: socket.userId,
            callRoom,
            timestamp: new Date().toISOString(),
          });

          io.to(`user_${socket.userId}`).emit("call_joined", {
            callRoom,
            participants: [socket.userId, callerId],
          });
        } else {
          io.to(`user_${callerId}`).emit("call_rejected", {
            recipientId: socket.userId,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    // Handle WebRTC signaling for video calls
    socket.on("webrtc_offer", (data) => {
      const { recipientId, offer } = data;
      io.to(`user_${recipientId}`).emit("webrtc_offer", {
        senderId: socket.userId,
        offer,
      });
    });

    socket.on("webrtc_answer", (data) => {
      const { recipientId, answer } = data;
      io.to(`user_${recipientId}`).emit("webrtc_answer", {
        senderId: socket.userId,
        answer,
      });
    });

    socket.on("webrtc_ice_candidate", (data) => {
      const { recipientId, candidate } = data;
      io.to(`user_${recipientId}`).emit("webrtc_ice_candidate", {
        senderId: socket.userId,
        candidate,
      });
    });

    socket.on("end_video_call", (data) => {
      const { recipientId } = data;
      io.to(`user_${recipientId}`).emit("call_ended", {
        endedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle match notifications
    socket.on("join_match_room", (data) => {
      const { matchId } = data;
      socket.join(`match_${matchId}`);
    });

    socket.on("send_match_message", (data) => {
      const { matchId, message } = data;
      io.to(`match_${matchId}`).emit("match_message", {
        senderId: socket.userId,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);

      // Update user offline status
      updateUserOnlineStatus(socket.userId, false);

      // Clean up connections
      activeConnections.delete(socket.id);
      userSockets.delete(socket.userId);

      // Notify relevant users
      socket.broadcast.emit("user_offline", {
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Send initial message history when joining
    socket.on("get_message_history", async (data) => {
      try {
        const { recipientId, limit = 50 } = data;
        const messages = await getConversationMessages(
          socket.userId,
          recipientId,
          limit
        );

        socket.emit("message_history", {
          recipientId,
          messages,
          hasMore: messages.length === limit,
        });
      } catch (error) {
        console.error("Get message history error:", error);
        socket.emit("error", { error: "Failed to get message history" });
      }
    });
  });
};

const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await updateUser(userId, {
      isOnline,
      lastSeen: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update online status error:", error);
  }
};

const sendNotificationToUser = (io, userId, notification) => {
  io.to(`user_${userId}`).emit("notification", {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

const getActiveUsers = () => {
  return Array.from(activeConnections.values());
};

module.exports = {
  setupSocketHandlers,
  sendNotificationToUser,
  getActiveUsers,
};
