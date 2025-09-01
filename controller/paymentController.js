const Payment = require('../models/Payment');
const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');

// eSewa Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  successUrl: 'http://localhost:3000/esewa-payment-success',
  failureUrl: 'http://localhost:3000/esewa-payment-failure',
  paymentUrl: process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  verifyUrl: process.env.ESEWA_VERIFY_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code='
};

// Generate HMAC signature
const generateSignature = (message, secretKey) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
};

// Create payment hash
const createPaymentHash = (totalAmount, transactionUuid, productCode) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return generateSignature(message, ESEWA_CONFIG.secretKey);
};

// Generate transaction UUID
const generateTransactionUuid = () => {
  return crypto.randomBytes(16).toString('hex');
};

const initiatePayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId, totalAmount } = req.body;

    // Validate order
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Generate transaction UUID
    const transactionUuid = generateTransactionUuid();

    // Create payment record
    const payment = new Payment({
      orderId,
      userId,
      transactionUuid,
      totalAmount,
      status: 'pending'
    });
    await payment.save();

    // Generate signature
    const signature = createPaymentHash(
      totalAmount,
      transactionUuid,
      ESEWA_CONFIG.merchantId
    );

    // Prepare eSewa payment data
    const paymentData = {
      amount: totalAmount,
      failure_url: ESEWA_CONFIG.failureUrl,
      product_delivery_charge: 0,
      product_service_charge: 0,
      product_code: ESEWA_CONFIG.merchantId,
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: ESEWA_CONFIG.successUrl,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid
    };

    res.json({
      success: true,
      paymentData,
      paymentUrl: ESEWA_CONFIG.paymentUrl
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment'
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { oid } = req.query;
    const userId = req.userId;

    if (!oid) {
      return res.status(400).json({
        success: false,
        message: 'Transaction UUID is required'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ 
      transactionUuid: oid,
      userId 
    }).populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    try {
      // Verify payment with eSewa
      const verifyUrl = `${ESEWA_CONFIG.verifyUrl}${ESEWA_CONFIG.merchantId}&transaction_uuid=${oid}`;
      const verificationResponse = await axios.get(verifyUrl);

      if (verificationResponse.data.status === 'COMPLETE') {
        // Update payment status
        payment.status = 'completed';
        payment.esewaResponse = verificationResponse.data;
        payment.updatedAt = new Date();
        await payment.save();

        // Update order status
        await Order.findByIdAndUpdate(payment.orderId._id, { 
          status: 'paid',
          paymentStatus: 'completed'
        });

        res.json({
          success: true,
          message: 'Payment verified successfully',
          payment,
          order: payment.orderId
        });
      } else {
        payment.status = 'failed';
        payment.esewaResponse = verificationResponse.data;
        await payment.save();

        res.status(400).json({
          success: false,
          message: 'Payment verification failed',
          payment
        });
      }

    } catch (verifyError) {
      console.error('eSewa verification error:', verifyError);
      
      payment.status = 'failed';
      payment.esewaResponse = { error: verifyError.message };
      await payment.save();

      res.status(500).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment
};