const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  getUser, 
  createSession, 
  updateSession,
  getUserSessions 
} = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create a new session
router.post('/', verifyToken, [
  body('participantId')
    .notEmpty()
    .withMessage('Participant ID is required'),
  body('skill')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill must be between 2 and 100 characters'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('Scheduled time must be a valid ISO 8601 date'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('sessionType')
    .optional()
    .isIn(['video', 'voice', 'chat', 'in-person'])
    .withMessage('Session type must be video, voice, chat, or in-person'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      participantId, 
      skill, 
      scheduledAt, 
      duration, 
      sessionType = 'video',
      description,
      location 
    } = req.body;
    
    const organizerId = req.user.id;

    if (participantId === organizerId) {
      return res.status(400).json({
        error: 'Cannot create session with yourself'
      });
    }

    // Verify participant exists and is active
    const participant = await getUser(participantId);
    if (!participant || !participant.isActive) {
      return res.status(404).json({
        error: 'Participant not found or inactive'
      });
    }

    // Validate scheduled time is in the future
    const sessionDate = new Date(scheduledAt);
    const now = new Date();
    
    if (sessionDate <= now) {
      return res.status(400).json({
        error: 'Scheduled time must be in the future'
      });
    }

    // Check if participants have compatible skills
    const organizer = await getUser(organizerId);
    const organizerSkills = organizer.skills || {};
    const participantSkills = participant.skills || {};

    const skillCompatible = (
      (organizerSkills.desired && organizerSkills.desired.includes(skill)) ||
      (organizerSkills.teachable && organizerSkills.teachable.includes(skill))
    ) && (
      (participantSkills.desired && participantSkills.desired.includes(skill)) ||
      (participantSkills.teachable && participantSkills.teachable.includes(skill))
    );

    if (!skillCompatible) {
      return res.status(400).json({
        error: 'Skill is not compatible between participants'
      });
    }

    // Create session data
    const sessionData = {
      organizerId,
      participants: [organizerId, participantId],
      skill,
      scheduledAt: sessionDate.toISOString(),
      duration: parseInt(duration),
      sessionType,
      description: description || '',
      location: location || '',
      status: 'scheduled',
      createdBy: organizerId,
      sessionRoom: `session_${[organizerId, participantId].sort().join('_')}_${Date.now()}`
    };

    const sessionId = await createSession(sessionData);

    // Get session with participant details
    const sessionDetails = {
      id: sessionId,
      ...sessionData,
      participants: [
        {
          id: organizer.id,
          name: organizer.profile.name,
          username: organizer.username,
          avatar: organizer.profile.avatar
        },
        {
          id: participant.id,
          name: participant.profile.name,
          username: participant.username,
          avatar: participant.profile.avatar
        }
      ]
    };

    res.status(201).json({
      message: 'Session created successfully',
      session: sessionDetails
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      error: 'Failed to create session'
    });
  }
});

// Get user's sessions
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, upcoming, limit = 20 } = req.query;
    
    let sessions = await getUserSessions(req.user.id);
    
    // Filter by status if specified
    if (status) {
      sessions = sessions.filter(session => session.status === status);
    }
    
    // Filter upcoming sessions if specified
    if (upcoming === 'true') {
      const now = new Date();
      sessions = sessions.filter(session => 
        new Date(session.scheduledAt) > now && session.status === 'scheduled'
      );
    }
    
    // Limit results
    sessions = sessions.slice(0, parseInt(limit));
    
    // Sort by scheduled time
    sessions.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    
    // Enhance sessions with participant details
    const enhancedSessions = await Promise.all(
      sessions.map(async (session) => {
        const otherParticipants = session.participants.filter(id => id !== req.user.id);
        const participantDetails = await Promise.all(
          otherParticipants.map(async (participantId) => {
            const user = await getUser(participantId);
            return user ? {
              id: user.id,
              name: user.profile.name,
              username: user.username,
              avatar: user.profile.avatar,
              isOnline: user.isOnline
            } : null;
          })
        );
        
        return {
          ...session,
          participantDetails: participantDetails.filter(Boolean)
        };
      })
    );

    res.json({
      sessions: enhancedSessions,
      total: enhancedSessions.length,
      filters: {
        status: status || null,
        upcoming: upcoming === 'true'
      }
    });

  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      error: 'Failed to get user sessions'
    });
  }
});

// Get specific session details
router.get('/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get user's sessions and find the specific one
    const sessions = await getUserSessions(req.user.id);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Verify user is part of this session
    if (!session.participants.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Get participant details
    const participantDetails = await Promise.all(
      session.participants.map(async (participantId) => {
        const user = await getUser(participantId);
        return user ? {
          id: user.id,
          name: user.profile.name,
          username: user.username,
          avatar: user.profile.avatar,
          isOnline: user.isOnline,
          skills: user.skills
        } : null;
      })
    );

    const sessionDetails = {
      ...session,
      participants: participantDetails.filter(Boolean)
    };

    res.json({
      session: sessionDetails
    });

  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({
      error: 'Failed to get session details'
    });
  }
});

// Update session
router.patch('/:sessionId', verifyToken, [
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be scheduled, confirmed, in-progress, completed, or cancelled'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled time must be a valid ISO 8601 date'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sessionId } = req.params;
    const updates = {};
    
    // Only allow updates for fields that are provided
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.scheduledAt !== undefined) updates.scheduledAt = req.body.scheduledAt;
    if (req.body.duration !== undefined) updates.duration = req.body.duration;
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update'
      });
    }

    // Get user's sessions to verify ownership
    const sessions = await getUserSessions(req.user.id);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Only the organizer or session participants can update
    if (!session.participants.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Add updated timestamp
    updates.updatedAt = new Date().toISOString();

    // Update session
    await updateSession(sessionId, updates);

    res.json({
      message: 'Session updated successfully',
      sessionId,
      updates
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      error: 'Failed to update session'
    });
  }
});

// Cancel session
router.post('/:sessionId/cancel', verifyToken, [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    
    // Get user's sessions to verify ownership
    const sessions = await getUserSessions(req.user.id);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Only session participants can cancel
    if (!session.participants.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Update session status
    await updateSession(sessionId, {
      status: 'cancelled',
      cancelledBy: req.user.id,
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || ''
    });

    res.json({
      message: 'Session cancelled successfully',
      sessionId,
      cancelledBy: req.user.id
    });

  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({
      error: 'Failed to cancel session'
    });
  }
});

// Complete session and add feedback
router.post('/:sessionId/complete', verifyToken, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
  body('learnedSkills')
    .optional()
    .isArray()
    .withMessage('Learned skills must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { rating, feedback, learnedSkills } = req.body;
    
    // Get user's sessions to verify ownership
    const sessions = await getUserSessions(req.user.id);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Verify session was scheduled and is in the past
    const sessionDate = new Date(session.scheduledAt);
    const now = new Date();
    
    if (sessionDate > now) {
      return res.status(400).json({
        error: 'Cannot complete a future session'
      });
    }

    // Complete session
    await updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      feedback: {
        rating,
        feedback: feedback || '',
        learnedSkills: learnedSkills || [],
        submittedBy: req.user.id
      }
    });

    res.json({
      message: 'Session completed successfully',
      sessionId,
      feedback: {
        rating,
        feedback: feedback || '',
        learnedSkills: learnedSkills || []
      }
    });

  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({
      error: 'Failed to complete session'
    });
  }
});

// Get available time slots for a user
router.get('/availability/:userId', verifyToken, [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('timezone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Timezone cannot exceed 50 characters')
], async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, timezone = 'UTC' } = req.query;
    
    // Verify the user exists and is active
    const user = await getUser(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found or inactive'
      });
    }

    // For now, return some sample available time slots
    // In a real implementation, you would check the user's calendar
    const baseDate = date ? new Date(date) : new Date();
    const availableSlots = generateSampleTimeSlots(baseDate);

    res.json({
      userId,
      date: baseDate.toISOString().split('T')[0],
      timezone,
      availableSlots
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      error: 'Failed to get availability'
    });
  }
});

// Helper function to generate sample time slots
function generateSampleTimeSlots(baseDate) {
  const slots = [];
  const today = new Date(baseDate);
  
  // Generate slots for the next 7 days, excluding today
  for (let day = 1; day <= 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // Skip weekends for demo
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate slots from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      
      slots.push({
        datetime: slotDate.toISOString(),
        duration: 60, // 1 hour slots
        available: Math.random() > 0.3 // 70% chance of being available
      });
    }
  }
  
  return slots.slice(0, 20); // Limit to 20 slots
}

module.exports = router;