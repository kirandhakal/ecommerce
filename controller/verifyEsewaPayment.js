const Payment = require('../models/Payment');
const Order = require('../models/Order');
const axios = require('axios');

// eSewa Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  verifyUrl: process.env.ESEWA_VERIFY_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code='
};

async function verifyEsewaPayment(req, res) {
  try {
    const { oid } = req.query;
    const userId = req.userId;

    // console.log("✅ [verifyEsewaPayment] Called with:");
    // console.log("oid:", oid);
    // console.log("userId:", userId);

    if (!oid) {
      // console.log("❌ Missing transaction UUID");
      return res.status(400).json({
        success: false,
        message: 'Transaction UUID is required',
      });
    }

    if (!userId) {
      // console.log("❌ userId is missing (unauthorized)");
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: userId missing from token',
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ transactionUuid: oid, userId }).populate('orderId');

    if (!payment) {
      // console.log("❌ Payment not found for oid + userId");
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // console.log("✅ Payment found:", payment);

    if (!payment.totalAmount) {
      // console.log("❌ Payment amount is missing");
      return res.status(400).json({
        success: false,
        message: "Payment amount is missing",
      });
    }

    // Construct eSewa verification URL
    const verifyUrl = `${ESEWA_CONFIG.verifyUrl}${ESEWA_CONFIG.merchantId}&transaction_uuid=${oid}&total_amount=${payment.totalAmount}`;
    // console.log("🌐 verifyUrl:", verifyUrl);
    // console.log("fewdfijodf",axios.get(verifyUrl))

    // Make the verification request to eSewa
    try {
      const verificationResponse = await axios.get(verifyUrl);
      // console.log("✅ verificationResponse.data:", verificationResponse.data);

      const status = verificationResponse.data?.status;
      // console.log("📦 verification status:", status);

      if (status === 'COMPLETE') {
        // console.log("💰 Payment is complete — updating database");

        // Update payment
        payment.status = 'completed';
        payment.esewaResponse = verificationResponse.data;
        payment.updatedAt = new Date();
        await payment.save();

        // Update order
        // console.log("🛒 Updating related order status...");
        const updatedOrder = await Order.findByIdAndUpdate(
          payment.orderId._id,
          {
            // status: 'paid',
            paymentStatus: 'completed',
          },
          { new: true }
        );


        // const updatedStock = await Order.findByIdAndUpdate(
        //   payment.orderId._id,
        //   {
        //     // status: 'paid',
        //     paymentStatus: 'completed',
        //   },
        //   { new: true }
        // );



        // console.log("✅ Order updated:", updatedOrder);

        return res.json({
          success: true,
          message: 'Payment verified successfully',
          payment,
          order: updatedOrder,
        });

      } else {
        // console.log("❌ Payment not complete. Marking as failed");

        payment.status = 'failed';
        payment.esewaResponse = verificationResponse.data;
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed',
          payment,
        });
      }

    } catch (verifyError) {
      // console.error("❌ eSewa verification request failed:", verifyError.message);

      // if (verifyError.response) {
      //    console.error("🔍 eSewa response error:", verifyError.response.data);
      // }

      payment.status = 'failed';
      payment.esewaResponse = {
        error: verifyError.message,
        ...(verifyError.response?.data && { responseData: verifyError.response.data })
      };
      await payment.save();

      return res.status(500).json({
        success: false,
        message: 'Payment verification failed due to network error',
        payment,
      });
    }

  } catch (error) {
    // console.error("❌ Unexpected server error in verifyEsewaPayment:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
}

module.exports = verifyEsewaPayment;
