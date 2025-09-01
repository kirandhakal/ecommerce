const Order = require('../models/Order');

async function createOrder(req, res) {
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
        message: 'Complete shipping information is required'
      });
    }

    // Create order
    const order = new Order({
      userId,
      items,
      shippingInfo,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      total: total || subtotal,
      paymentMethod: paymentMethod || 'esewa',
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder._id,
      order: savedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
}

module.exports = createOrder;