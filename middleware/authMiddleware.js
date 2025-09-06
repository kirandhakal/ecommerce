const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // optional if you want fresh user check

async function authToken(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.body?.token;

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No authentication token provided.",
        error: true,
        success: false,
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    // Optional: fetch user from DB to validate live role/status
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    req.userId = user._id;
    req.user = user; // full user doc available

    next();
  } catch (err) {
    console.error("Auth Token Error:", err);
    let message = "Invalid token";
    if (err.name === "TokenExpiredError") message = "Token has expired";
    res.status(401).json({
      message,
      error: true,
      success: false,
    });
  }
}

module.exports = authToken;
