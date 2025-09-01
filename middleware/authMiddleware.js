const jwt = require('jsonwebtoken');

async function authToken(req, res, next) {
  try {
    console.log("authToken middleware called");
    
    const token = req.cookies?.token;
    console.log("Received token:", token); // FIXED: removed "fee" 
    
    if (!token) {
      return res.status(401).json({
        message: "User is not logged in", // FIXED: typo "indee" -> "in"
        error: true,
        success: false,
      });
    }

    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("JWT verification error:", err.message);
        return res.status(403).json({
          message: "Invalid or expired token",
          error: true,
          success: false,
        });
      }
      req.userId = decoded?._id;
      next(); 
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Authentication error",
      error: true,
      success: false,
    });
  }
}

module.exports = authToken;
