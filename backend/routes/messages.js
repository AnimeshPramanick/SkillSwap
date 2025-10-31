const express = require("express");
const { body, validationResult, query } = require("express-validator");
const {
  getUser,
  createMessage,
  getConversationMessages,
  updateUser,
} = require("../config/firebase");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Send a message
router.post(
  "/",
  verifyToken,
  [
    body("recipientId").notEmpty().withMessage("Recipient ID is required"),
    body("content")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),
    body("type")
      .optional()
      .isIn(["text", "image", "file", "voice"])
      .withMessage("Message type must be text, image, file, or voice"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { recipientId, content, type = "text" } = req.body;
      const senderId = req.user.id;

      if (recipientId === senderId) {
        return res.status(400).json({
          error: "Cannot send message to yourself",
        });
      }

      // Verify recipient exists
      const recipient = await getUser(recipientId);
      if (!recipient || !recipient.isActive) {
        return res.status(404).json({
          error: "Recipient not found or inactive",
        });
      }

      // Create message data
      const messageData = {
        senderId,
        recipientId,
        message: content,
        messageType: type,
        participants: [senderId, recipientId].sort().join("_"),
        isRead: false,
        sender: {
          id: senderId,
          name: req.user.profile?.name || req.user.username,
          avatar: req.user.profile?.avatar || "",
        },
      };

      const messageId = await createMessage(messageData);

      // Update sender's last message activity
      await updateUser(senderId, {
        lastMessageActivity: new Date().toISOString(),
      });

      const messageResponse = {
        id: messageId,
        ...messageData,
        timestamp: new Date().toISOString(),
      };

      // Emit socket event to recipient if they're connected
      const io = req.app.get("io");
      if (io) {
        console.log(
          `Emitting new_message to user_${recipientId}:`,
          messageResponse
        );
        io.to(`user_${recipientId}`).emit("new_message", messageResponse);
      } else {
        console.log("IO instance not found!");
      }

      res.status(201).json({
        message: messageResponse,
      });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({
        error: "Failed to send message",
      });
    }
  }
);

// Get conversation messages
router.get(
  "/conversation/:userId",
  verifyToken,
  [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      // Verify the other user exists
      const otherUser = await getUser(userId);
      if (!otherUser || !otherUser.isActive) {
        return res.status(404).json({
          error: "User not found or inactive",
        });
      }

      // Get conversation messages
      const messages = await getConversationMessages(
        req.user.id,
        userId,
        parseInt(limit)
      );

      // Mark messages as read (for messages sent to current user)
      const unreadMessages = messages.filter(
        (msg) => msg.recipientId === req.user.id && !msg.isRead
      );

      // In a real implementation, you would batch update these messages
      // For now, we'll just return the messages

      res.json({
        conversation: {
          userId,
          user: {
            id: otherUser.id,
            name: otherUser.profile.name,
            username: otherUser.username,
            avatar: otherUser.profile.avatar,
            isOnline: otherUser.isOnline,
          },
        },
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: messages.length === parseInt(limit),
        },
        unreadCount: unreadMessages.length,
      });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({
        error: "Failed to get conversation",
      });
    }
  }
);

// Mark messages as read
router.patch("/conversation/:userId/read", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // In a real implementation, you would update messages in Firestore
    // For now, we'll just return success
    // await updateMessagesReadStatus(req.user.id, userId);

    res.json({
      message: "Messages marked as read",
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      error: "Failed to mark messages as read",
    });
  }
});

// Get all conversations for a user
router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require("../config/firebase").getFirestore();

    // Get all messages where user is sender or recipient (without orderBy to avoid index requirement)
    const sentSnapshot = await db
      .collection("messages")
      .where("senderId", "==", userId)
      .get();

    const receivedSnapshot = await db
      .collection("messages")
      .where("recipientId", "==", userId)
      .get();

    // Combine and get unique conversations
    const conversationMap = new Map();

    const processMessage = async (doc) => {
      const message = doc.data();
      const otherUserId =
        message.senderId === userId ? message.recipientId : message.senderId;

      const existingConv = conversationMap.get(otherUserId);

      // Only update if this is the first message or a newer message
      if (
        !existingConv ||
        !existingConv.lastMessage ||
        (message.timestamp &&
          (!existingConv.lastMessage.timestamp ||
            new Date(message.timestamp) >
              new Date(existingConv.lastMessage.timestamp)))
      ) {
        // Get the other user's details if not already loaded
        let otherUser = existingConv?.participant;
        if (!otherUser) {
          const userData = await getUser(otherUserId);
          if (!userData || !userData.isActive) return;

          otherUser = {
            id: userData.id,
            username: userData.username,
            profile: userData.profile,
            isOnline: userData.isOnline,
            lastSeen: userData.lastSeen,
          };
        }

        conversationMap.set(otherUserId, {
          id: otherUserId,
          participant: otherUser,
          lastMessage: {
            content: message.message,
            timestamp: message.timestamp,
            senderId: message.senderId,
            isRead: message.isRead,
          },
          unreadCount: existingConv?.unreadCount || 0,
        });
      }
    };

    // Process all messages
    for (const doc of sentSnapshot.docs) {
      await processMessage(doc);
    }
    for (const doc of receivedSnapshot.docs) {
      await processMessage(doc);
    }

    // Also get accepted matches (even without messages)
    const matchesSnapshot = await db
      .collection("matches")
      .where("participants", "array-contains", userId)
      .where("status", "==", "accepted")
      .get();

    for (const doc of matchesSnapshot.docs) {
      const match = doc.data();
      const otherUserId = match.participants.find((id) => id !== userId);

      if (otherUserId && !conversationMap.has(otherUserId)) {
        // Get the other user's details
        const otherUser = await getUser(otherUserId);

        if (otherUser && otherUser.isActive) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            participant: {
              id: otherUser.id,
              username: otherUser.username,
              profile: otherUser.profile,
              isOnline: otherUser.isOnline,
              lastSeen: otherUser.lastSeen,
            },
            lastMessage: null, // No messages yet
            unreadCount: 0,
          });
        }
      }
    }

    // Calculate unread count for each conversation
    const conversations = Array.from(conversationMap.values());

    for (const conv of conversations) {
      const unreadSnapshot = await db
        .collection("messages")
        .where("recipientId", "==", userId)
        .where("senderId", "==", conv.id)
        .where("isRead", "==", false)
        .get();

      conv.unreadCount = unreadSnapshot.size;
    }

    // Sort by last message timestamp (conversations without messages go to bottom)
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.toDate?.() || new Date(0);
      const timeB = b.lastMessage?.timestamp?.toDate?.() || new Date(0);
      return timeB - timeA;
    });

    const totalUnread = conversations.reduce(
      (sum, conv) => sum + conv.unreadCount,
      0
    );

    res.json({
      conversations,
      totalUnread,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      error: "Failed to get conversations",
      details: error.message,
    });
  }
});

// Send typing indicator
router.post(
  "/typing",
  verifyToken,
  [
    body("recipientId").notEmpty().withMessage("Recipient ID is required"),
    body("isTyping").isBoolean().withMessage("isTyping must be a boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { recipientId, isTyping } = req.body;

      // In a real implementation, you would emit this via Socket.io
      // For now, we'll just return success

      res.json({
        message: "Typing indicator sent",
        recipientId,
        isTyping,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Send typing indicator error:", error);
      res.status(500).json({
        error: "Failed to send typing indicator",
      });
    }
  }
);

// Delete a message (soft delete)
router.delete("/:messageId", verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    // In a real implementation, you would update the message to mark it as deleted
    // await updateMessage(messageId, { isDeleted: true, deletedAt: new Date().toISOString() });

    res.json({
      message: "Message deleted successfully",
      messageId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      error: "Failed to delete message",
    });
  }
});

// Upload file attachment
router.post(
  "/upload",
  verifyToken,
  [
    body("recipientId").notEmpty().withMessage("Recipient ID is required"),
    body("fileType")
      .isIn(["image", "file", "voice"])
      .withMessage("File type must be image, file, or voice"),
    body("fileData").notEmpty().withMessage("File data is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { recipientId, fileType, fileData } = req.body;
      const senderId = req.user.id;

      // Verify recipient exists
      const recipient = await getUser(recipientId);
      if (!recipient || !recipient.isActive) {
        return res.status(404).json({
          error: "Recipient not found or inactive",
        });
      }

      // In a real implementation, you would:
      // 1. Upload file to cloud storage (Cloudinary/S3)
      // 2. Get file URL
      // 3. Create message with file URL

      // For now, we'll return a placeholder
      const fileUrl = `https://example.com/files/${Date.now()}_uploaded_file`;

      // Create message with file attachment
      const messageData = {
        senderId,
        recipientId,
        message: `[${fileType} attachment]`,
        messageType: fileType,
        fileUrl,
        participants: [senderId, recipientId].sort().join("_"),
        isRead: false,
      };

      const messageId = await createMessage(messageData);

      res.json({
        message: "File uploaded and sent successfully",
        messageId,
        fileUrl,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Upload file error:", error);
      res.status(500).json({
        error: "Failed to upload file",
      });
    }
  }
);

// Search messages in conversation
router.get(
  "/conversation/:userId/search",
  verifyToken,
  [
    query("q")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Search query must be between 1 and 100 characters"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { userId } = req.params;
      const { q, limit = 20 } = req.query;

      // In a real implementation, you would search through messages
      // For now, we'll return an empty result

      res.json({
        searchQuery: q,
        results: [],
        total: 0,
        limit: parseInt(limit),
      });
    } catch (error) {
      console.error("Search messages error:", error);
      res.status(500).json({
        error: "Failed to search messages",
      });
    }
  }
);

module.exports = router;
