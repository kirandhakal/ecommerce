const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from multiple sources
    const token = req.cookies?.token || 
                  req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.',
        error: true
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    
    // Get full user data from database
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.',
        error: true
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    
    let message = 'Invalid token.';
    let statusCode = 401;
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format.';
    } else if (error.name === 'CastError') {
      message = 'Invalid user ID in token.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message,
      error: true
    });
  }
};

module.exports = authMiddleware;
