const Order = require('../models/Order');
const User = require('../models/userModel');
const Product = require('../models/productModel');

exports.myOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found",
                orders: [] // Explicit empty array
            });
        }

        let orders = [];
        if (user.role === 'SELLER') {
            const sellerProducts = await Product.find({ userId: req.userId }, '_id');
            const sellerProductIds = sellerProducts.map(prod => prod._id.toString());
            orders = await Order.find({
                'items.productId': { $in: sellerProductIds }
            }).sort({ createdAt: -1 });
        } else {
            orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        }

        res.json({ 
            success: true,
            orders: orders || [] // Ensure array even if null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch orders',
            orders: [] // Fallback empty array
        });
    }
};

exports.completeOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ _id: orderId, userId: req.userId });

        if (!order) {
            return res.status(404).json({ 
                success: false,
                error: 'Order not found'
            });
        }

        order.status = 'delivered';
        order.paymentStatus = "completed";
        await order.save();

        res.json({ 
            success: true,
            message: 'Order marked as completed',
            order 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Failed to update order status'
        });
    }
};