const Order = require('../models/Order');

async function getUserOrders(req, res) {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: orders,
      message: 'Orders fetched successfully'
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
}

module.exports = getUserOrders;