const userModel = require("../models/userModel");
const Notification = require("../models/notificationModel"); // Make sure this path is correct

async function sellerStatus(req, res) {
    try {
        const { userId, status } = req.body;

        // Validate status
        if (!['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updatedSeller = await userModel.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        );

        if (!updatedSeller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // ✅ Send notification if status is ACCEPTED
        if (status === 'ACCEPTED') {
            await Notification.create({
                userId: updatedSeller._id,
                message: '🎉 Your seller request has been approved. You can now manage your shop.',
                type: 'SELLER_STATUS'

            });
        }

        res.json({
            success: true,
            data: updatedSeller
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = sellerStatus;
