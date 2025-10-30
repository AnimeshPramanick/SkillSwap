const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  getUser, 
  searchUsers,
  createMatch,
  updateMatch,
  getUserMatches 
} = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Find potential matches based on complementary skills
router.get('/find-matches', verifyToken, async (req, res) => {
  try {
    const currentUser = await getUser(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const userDesiredSkills = currentUser.skills?.desired || [];
    const userTeachableSkills = currentUser.skills?.teachable || [];

    if (userDesiredSkills.length === 0 && userTeachableSkills.length === 0) {
      return res.status(400).json({
        error: 'Please add some skills to your profile before searching for matches'
      });
    }

    // Get all active users except current user
    const allUsers = await searchUsers({ isOnline: undefined, limit: 1000 });
    const potentialMatches = allUsers
      .filter(user => 
        user.id !== req.user.id && 
        user.isActive && 
        user.skills && 
        user.skills.teachable && 
        user.skills.desired
      );

    // Score matches based on skill compatibility
    const scoredMatches = potentialMatches.map(user => {
      const userDesired = user.skills.desired;
      const userTeachable = user.skills.teachable;

      // Calculate skill overlap scores
      const desiredMatchScore = userDesiredSkills.filter(skill => 
        userTeachable.includes(skill)
      ).length;

      const teachableMatchScore = userTeachableSkills.filter(skill => 
        userDesired.includes(skill)
      ).length;

      // Calculate compatibility score (weighted)
      const compatibilityScore = (desiredMatchScore * 0.6) + (teachableMatchScore * 0.4);

      // Bonus for online users
      const onlineBonus = user.isOnline ? 0.2 : 0;

      // Bonus for active users (recent activity)
      const activityBonus = calculateActivityBonus(user);

      const totalScore = compatibilityScore + onlineBonus + activityBonus;

      return {
        ...user,
        password: undefined,
        email: undefined,
        matchScore: {
          total: totalScore,
          desiredMatches: desiredMatchScore,
          teachableMatches: teachableMatchScore,
          compatibility: compatibilityScore,
          onlineBonus,
          activityBonus
        },
        skillAlignment: {
          theyCanTeachMe: userDesiredSkills.filter(skill => userTeachable.includes(skill)),
          theyWantToLearn: userTeachableSkills.filter(skill => userDesired.includes(skill))
        }
      };
    });

    // Filter out matches with zero score and sort by total score
    const filteredMatches = scoredMatches
      .filter(match => match.matchScore.total > 0)
      .sort((a, b) => b.matchScore.total - a.matchScore.total)
      .slice(0, 20); // Limit to top 20 matches

    // Remove sensitive data
    const safeMatches = filteredMatches.map(match => {
      const { password, email, ...safeData } = match;
      return safeData;
    });

    res.json({
      matches: safeMatches,
      yourSkills: {
        desired: userDesiredSkills,
        teachable: userTeachableSkills
      },
      searchCriteria: {
        lookingForUsersWhoCanTeach: userDesiredSkills,
        usersWhoWantToLearn: userTeachableSkills
      }
    });

  } catch (error) {
    console.error('Find matches error:', error);
    res.status(500).json({
      error: 'Failed to find matches'
    });
  }
});

// Create a match with another user
router.post('/', verifyToken, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        error: 'Cannot create match with yourself'
      });
    }

    // Check if both users exist and are active
    const [currentUser, targetUser] = await Promise.all([
      getUser(currentUserId),
      getUser(userId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        error: 'One or both users not found'
      });
    }

    if (!currentUser.isActive || !targetUser.isActive) {
      return res.status(400).json({
        error: 'Cannot match with inactive users'
      });
    }

    // Check if match already exists
    const existingMatches = await getUserMatches(currentUserId);
    const existingMatch = existingMatches.find(match => 
      match.participants.includes(userId)
    );

    if (existingMatch) {
      return res.status(400).json({
        error: 'Match already exists',
        match: existingMatch
      });
    }

    // Check skill compatibility
    const currentDesired = currentUser.skills?.desired || [];
    const currentTeachable = currentUser.skills?.teachable || [];
    const targetDesired = targetUser.skills?.desired || [];
    const targetTeachable = targetUser.skills?.teachable || [];

    const canTeachEachOther = (
      currentDesired.some(skill => targetTeachable.includes(skill)) ||
      targetDesired.some(skill => currentTeachable.includes(skill))
    );

    if (!canTeachEachOther) {
      return res.status(400).json({
        error: 'No skill compatibility found between users'
      });
    }

    // Create the match
    const matchData = {
      participants: [currentUserId, userId],
      status: 'active',
      compatibility: {
        user1DesiredMatches: currentDesired.filter(skill => targetTeachable.includes(skill)),
        user2DesiredMatches: targetDesired.filter(skill => currentTeachable.includes(skill)),
        totalSharedInterests: currentDesired.filter(skill => targetTeachable.includes(skill)).length +
                             targetDesired.filter(skill => currentTeachable.includes(skill)).length
      },
      createdBy: currentUserId,
      lastActivity: new Date().toISOString()
    };

    const matchId = await createMatch(matchData);

    res.status(201).json({
      message: 'Match created successfully',
      matchId,
      match: {
        id: matchId,
        ...matchData,
        participants: [
          {
            id: currentUser.id,
            name: currentUser.profile.name,
            username: currentUser.username,
            avatar: currentUser.profile.avatar
          },
          {
            id: targetUser.id,
            name: targetUser.profile.name,
            username: targetUser.username,
            avatar: targetUser.profile.avatar
          }
        ]
      }
    });

  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({
      error: 'Failed to create match'
    });
  }
});

// Get user's matches
router.get('/', verifyToken, async (req, res) => {
  try {
    const matches = await getUserMatches(req.user.id);
    
    // Enhance matches with participant data
    const enhancedMatches = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.participants.find(id => id !== req.user.id);
        const otherUser = await getUser(otherUserId);
        
        if (!otherUser) {
          return {
            ...match,
            otherParticipant: null
          };
        }

        return {
          ...match,
          otherParticipant: {
            id: otherUser.id,
            name: otherUser.profile.name,
            username: otherUser.username,
            avatar: otherUser.profile.avatar,
            isOnline: otherUser.isOnline,
            lastSeen: otherUser.lastSeen,
            skills: otherUser.skills
          }
        };
      })
    );

    res.json({
      matches: enhancedMatches,
      total: enhancedMatches.length
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      error: 'Failed to get matches'
    });
  }
});

// Get specific match details
router.get('/:matchId', verifyToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // Get user's matches and find the specific one
    const matches = await getUserMatches(req.user.id);
    const match = matches.find(m => m.id === matchId);
    
    if (!match) {
      return res.status(404).json({
        error: 'Match not found'
      });
    }

    // Verify user is part of this match
    if (!match.participants.includes(req.user.id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const otherUserId = match.participants.find(id => id !== req.user.id);
    const otherUser = await getUser(otherUserId);
    
    const matchDetails = {
      ...match,
      participants: [
        {
          id: req.user.id,
          isCurrentUser: true
        },
        {
          id: otherUserId,
          isCurrentUser: false,
          name: otherUser?.profile.name,
          username: otherUser?.username,
          avatar: otherUser?.profile.avatar,
          isOnline: otherUser?.isOnline,
          lastSeen: otherUser?.lastSeen,
          skills: otherUser?.skills
        }
      ]
    };

    res.json({
      match: matchDetails
    });

  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({
      error: 'Failed to get match details'
    });
  }
});

// Update match status
router.patch('/:matchId/status', verifyToken, [
  body('status')
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Status must be active, inactive, or blocked')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { matchId } = req.params;
    const { status } = req.body;

    // Get user's matches
    const matches = await getUserMatches(req.user.id);
    const match = matches.find(m => m.id === matchId);
    
    if (!match) {
      return res.status(404).json({
        error: 'Match not found'
      });
    }

    // Update match status
    await updateMatch(matchId, {
      status,
      updatedAt: new Date().toISOString()
    });

    res.json({
      message: 'Match status updated successfully',
      matchId,
      status
    });

  } catch (error) {
    console.error('Update match status error:', error);
    res.status(500).json({
      error: 'Failed to update match status'
    });
  }
});

// Get match suggestions based on current user's skills
router.get('/suggestions/refresh', verifyToken, async (req, res) => {
  try {
    // Get fresh potential matches
    const potentialMatches = await searchUsers({ isOnline: undefined, limit: 100 });
    const currentUser = await getUser(req.user.id);
    
    const userDesiredSkills = currentUser.skills?.desired || [];
    const userTeachableSkills = currentUser.skills?.teachable || [];

    // Filter and score new potential matches
    const freshSuggestions = potentialMatches
      .filter(user => 
        user.id !== req.user.id && 
        user.isActive && 
        user.skills?.teachable && 
        user.skills?.desired
      )
      .map(user => {
        const userDesired = user.skills.desired;
        const userTeachable = user.skills.teachable;

        const desiredMatchScore = userDesiredSkills.filter(skill => 
          userTeachable.includes(skill)
        ).length;

        const teachableMatchScore = userTeachableSkills.filter(skill => 
          userDesired.includes(skill)
        ).length;

        const compatibilityScore = (desiredMatchScore * 0.6) + (teachableMatchScore * 0.4);

        return {
          ...user,
          password: undefined,
          email: undefined,
          matchScore: compatibilityScore,
          skillAlignment: {
            theyCanTeachMe: userDesiredSkills.filter(skill => userTeachable.includes(skill)),
            theyWantToLearn: userTeachableSkills.filter(skill => userDesired.includes(skill))
          }
        };
      })
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({
      suggestions: freshSuggestions,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get match suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get match suggestions'
    });
  }
});

// Helper function to calculate activity bonus
function calculateActivityBonus(user) {
  const now = new Date();
  const lastSeen = new Date(user.lastSeen || user.createdAt);
  const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24);
  
  if (daysDiff < 1) return 0.3; // Very active
  if (daysDiff < 7) return 0.2; // Active
  if (daysDiff < 30) return 0.1; // Somewhat active
  return 0; // Inactive
}

module.exports = router;