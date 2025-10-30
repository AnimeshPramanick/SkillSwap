const jwt = require('jsonwebtoken');
const { getUser } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided or invalid format.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Token is missing.' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated.' 
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      profile: user.profile
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token has expired.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Token verification failed.' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without auth
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without auth
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUser(decoded.userId);
    
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile
      };
    }

    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'skillswap-api',
      audience: 'skillswap-client'
    }
  );
};

const refreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'skillswap-api',
      audience: 'skillswap-client'
    }
  );
};

module.exports = {
  verifyToken,
  optionalAuth,
  generateToken,
  refreshToken
};