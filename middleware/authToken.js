const jwt = require('jsonwebtoken');

async function authToken(req, res, next) {
  try {
    // Get token from multiple sources for flexibility
    const token = req.cookies?.token || 
                  req.header('Authorization')?.replace('Bearer ', '') ||
                  req.body?.token;

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No authentication token provided.",
        error: true,
        success: false,
      });
    }

    // Verify token
    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
      if (err) {
        let message = "Invalid token";
        if (err.name === 'TokenExpiredError') {
          message = "Token has expired";
        } else if (err.name === 'JsonWebTokenError') {
          message = "Invalid token format";
        }
        
        return res.status(403).json({
          message,
          error: true,
          success: false,
        });
      }

      req.userId = decoded._id;
      req.user = { _id: decoded._id }; // Basic user info
      next();
    });

  } catch (err) {
    console.error('Auth Token Error:', err);
    res.status(500).json({
      message: "Internal server error during authentication",
      error: true,
      success: false,
    });
  }
}

module.exports = authToken;
