const Order = require("../models/Order");
const Product = require("../models/productModel");
const Notification = require("../models/notificationModel");

const notifySeller = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        // 1. Get the order with items
        const order = await Order.findById(orderId).lean();
        // console.log('the order is ', order)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Rename for clarity (same value as order.userId)
        const {
            userId: buyerId,
            items,
            total,
            paymentMethod,
            shippingInfo // seller id 68311b374b9bbf8d02944f25   product id 685936c574aaa22ae5fd0bd6
        } = order;       // order id is 6886449e136cf2ecb03a2aa0  and buyer id is 68311b224b9bbf8d0294497a

        // 2. Group items by sellerId
        const sellerMap = new Map();

        for (const item of items) {
            const product = await Product.findById(item.productId).lean();


            if (!product || !product.userId) continue;

            const sellerId = product.userId.toString();

            if (!sellerMap.has(sellerId)) {
                sellerMap.set(sellerId, []);
            }

            sellerMap.get(sellerId).push({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            });
        }

        // 3. Create notifications
        const notificationPromises = [];

        for (const [sellerId, sellerItems] of sellerMap.entries()) {
            const message = `🎉 New order from a user! ${sellerItems.length} product(s) purchased.`;

            const notification = await Notification.create({
                userId: sellerId,
                message,
                type: 'ORDER_PLACED',
                read: false,
                metadata: {
                    orderId,
                    buyerId,
                    items: sellerItems,
                    totalAmount: total,
                    paymentMethod,
                    shippingInfo
                }
            });

            notificationPromises.push(notification);
        }

        await Promise.all(notificationPromises);

        return res.json({
            success: true,
            message: "Seller(s) notified successfully",
        });

    } catch (error) {
        console.error("notifySeller error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while notifying sellers",
            error: error.message
        });
    }
};

module.exports = notifySeller;
