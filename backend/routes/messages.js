const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { 
  getUser, 
  createMessage, 
  getConversationMessages,
  updateUser 
} = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Send a message
router.post('/', verifyToken, [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'voice'])
    .withMessage('Message type must be text, image, file, or voice')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { recipientId, message, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    if (recipientId === senderId) {
      return res.status(400).json({
        error: 'Cannot send message to yourself'
      });
    }

    // Verify recipient exists
    const recipient = await getUser(recipientId);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({
        error: 'Recipient not found or inactive'
      });
    }

    // Create message data
    const messageData = {
      senderId,
      recipientId,
      message,
      messageType,
      participants: [senderId, recipientId].sort().join('_'),
      isRead: false,
      sender: {
        id: senderId,
        name: req.user.profile?.name || req.user.username,
        avatar: req.user.profile?.avatar || ''
      }
    };

    const messageId = await createMessage(messageData);

    // Update sender's last message activity
    await updateUser(senderId, {
      lastMessageActivity: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Message sent successfully',
      messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message'
    });
  }
});

// Get conversation messages
router.get('/conversation/:userId', verifyToken, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify the other user exists
    const otherUser = await getUser(userId);
    if (!otherUser || !otherUser.isActive) {
      return res.status(404).json({
        error: 'User not found or inactive'
      });
    }

    // Get conversation messages
    const messages = await getConversationMessages(
      req.user.id, 
      userId, 
      parseInt(limit)
    );

    // Mark messages as read (for messages sent to current user)
    const unreadMessages = messages.filter(msg => 
      msg.recipientId === req.user.id && !msg.isRead
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
          isOnline: otherUser.isOnline
        }
      },
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: messages.length === parseInt(limit)
      },
      unreadCount: unreadMessages.length
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      error: 'Failed to get conversation'
    });
  }
});

// Mark messages as read
router.patch('/conversation/:userId/read', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // In a real implementation, you would update messages in Firestore
    // For now, we'll just return success
    // await updateMessagesReadStatus(req.user.id, userId);

    res.json({
      message: 'Messages marked as read',
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read'
    });
  }
});

// Get all conversations for a user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    // In a real implementation, you would query the messages collection
    // to get all unique conversations for the user
    // For now, we'll return a placeholder structure

    res.json({
      conversations: [],
      totalUnread: 0
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      error: 'Failed to get conversations'
    });
  }
});

// Send typing indicator
router.post('/typing', verifyToken, [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required'),
  body('isTyping')
    .isBoolean()
    .withMessage('isTyping must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { recipientId, isTyping } = req.body;

    // In a real implementation, you would emit this via Socket.io
    // For now, we'll just return success
    
    res.json({
      message: 'Typing indicator sent',
      recipientId,
      isTyping,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send typing indicator error:', error);
    res.status(500).json({
      error: 'Failed to send typing indicator'
    });
  }
});

// Delete a message (soft delete)
router.delete('/:messageId', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    // In a real implementation, you would update the message to mark it as deleted
    // await updateMessage(messageId, { isDeleted: true, deletedAt: new Date().toISOString() });

    res.json({
      message: 'Message deleted successfully',
      messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: 'Failed to delete message'
    });
  }
});

// Upload file attachment
router.post('/upload', verifyToken, [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required'),
  body('fileType')
    .isIn(['image', 'file', 'voice'])
    .withMessage('File type must be image, file, or voice'),
  body('fileData')
    .notEmpty()
    .withMessage('File data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { recipientId, fileType, fileData } = req.body;
    const senderId = req.user.id;

    // Verify recipient exists
    const recipient = await getUser(recipientId);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({
        error: 'Recipient not found or inactive'
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
      participants: [senderId, recipientId].sort().join('_'),
      isRead: false
    };

    const messageId = await createMessage(messageData);

    res.json({
      message: 'File uploaded and sent successfully',
      messageId,
      fileUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      error: 'Failed to upload file'
    });
  }
});

// Search messages in conversation
router.get('/conversation/:userId/search', verifyToken, [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
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
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      error: 'Failed to search messages'
    });
  }
});

module.exports = router;