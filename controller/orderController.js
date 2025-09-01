const Order = require('../models/Order');

const createOrder = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { items, shippingInfo, subtotal, shipping, total, paymentMethod } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping information is required'
      });
    }

    // Create order
    const order = new Order({
      userId,
      items,
      shippingInfo,
      subtotal,
      shipping,
      total,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: order._id,
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders
};