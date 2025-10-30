const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { 
  createUser, 
  getUser, 
  updateUser 
} = require('../config/firebase');
const { 
  generateToken, 
  refreshToken, 
  verifyToken 
} = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('username')
    .isAlphanumeric()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters long and contain only letters and numbers'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters long'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, username, name, bio } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user data
    const userData = {
      email,
      username,
      password: hashedPassword,
      profile: {
        name,
        bio: bio || '',
        avatar: '',
        location: '',
        timezone: 'UTC'
      },
      skills: {
        teachable: [],
        desired: []
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          matches: true,
          messages: true
        },
        privacy: {
          showOnline: true,
          showLocation: false
        }
      },
      stats: {
        totalSessions: 0,
        totalHours: 0,
        averageRating: 0,
        totalReviews: 0
      },
      isActive: true,
      isOnline: false,
      lastSeen: new Date().toISOString()
    };

    // Create user in database
    const userId = await createUser(userData);

    // Generate tokens
    const token = generateToken(userId);
    const refresh = refreshToken(userId);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        username,
        profile: userData.profile
      },
      tokens: {
        accessToken: token,
        refreshToken: refresh
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Login user
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refresh = refreshToken(user.id);

    // Update last login
    await updateUser(user.id, {
      lastLogin: new Date().toISOString(),
      isOnline: true
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile,
        skills: user.skills,
        stats: user.stats
      },
      tokens: {
        accessToken: token,
        refreshToken: refresh
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Refresh token
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await getUser(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found or inactive'
      });
    }

    // Generate new access token
    const newToken = generateToken(user.id);

    res.json({
      accessToken: newToken,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token'
    });
  }
});

// Logout user
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Update user online status
    await updateUser(req.user.id, {
      isOnline: false,
      lastSeen: new Date().toISOString()
    });

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Don't send sensitive data
    const { password, ...userProfile } = user;

    res.json({
      user: userProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile'
    });
  }
});

// Helper function to get user by email
async function getUserByEmail(email) {
  const { getFirestore } = require('../config/firebase');
  const admin = require('firebase-admin');
  
  const db = getFirestore();
  const snapshot = await db.collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data();
}

module.exports = router;