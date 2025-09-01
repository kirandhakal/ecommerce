const userModel = require("../models/userModel");

async function pendingSellers(req, res) {
  try {
    // Find only users with status: "pending"
    const allUsers = await userModel.find({ status: "PENDING" });

    res.json({
      message: "All users with pending status",
      data: allUsers,
      success: true,
      error: false
    });

  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false
    });
  }
}

module.exports = pendingSellers;
