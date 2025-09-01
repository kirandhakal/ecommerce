const Notification = require('../models/notificationModel');

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ data: notifications, 
      success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread notification count
const getNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.userId, read: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a single notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    // console.log("notidofieofo",notificationId)
    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.userId },
      { read: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getNotifications,
  getNotificationCount,
  markAllAsRead,
  markNotificationAsRead,
};
